import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import {
  submitBatchToJudge0,
  pollBatchJudge0Results,
  mapJudge0StatusToVerdict,
} from "../utils/judge0";
import { SupportedLanguage } from "../models/submission/Language";
import { logger } from "../utils/logger";

interface RunTestcase {
  stdin: string;
  expectedOutput: string;
}

interface RunJobData {
  code: string;
  language: SupportedLanguage;
  testcases: RunTestcase[];
}

interface SingleTestcaseResult {
  testcase: number;
  input?: string;
  expectedOutput?: string;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  verdict: string;
  runtime: number | null;
  memory: number | null;
  exitCode?: number;
}

interface RunJobResult {
  totalTestcases: number;
  passedCount: number;
  results: SingleTestcaseResult[];
}

export const runWorker = new Worker<RunJobData, RunJobResult>(
  "code-run",
  async (job) => {
    const { code, language, testcases } = job.data;

    try {
      const submissions = testcases
        .filter((tc) => !!tc)
        .map((tc) => ({
          code,
          language,
          stdin: tc.stdin,
          expectedOutput: tc.expectedOutput,
        }));

      if (submissions.length === 0) {
        return {
          totalTestcases: 0,
          passedCount: 0,
          results: [],
        };
      }

      const tokens = await submitBatchToJudge0(submissions);
      const judge0Results = await pollBatchJudge0Results(tokens);

      const results: SingleTestcaseResult[] = [];
      let passedCount = 0;

      for (let i = 0; i < judge0Results.length; i++) {
        const result = judge0Results[i];
        const testcase = submissions[i];
        if (!result || !testcase) continue;

        const verdict = mapJudge0StatusToVerdict(result.status.id);
        const output = result.stdout?.trim() ?? "";
        const expected = (testcase.expectedOutput || "").trim();

        const passed = verdict === "ACCEPTED" && output === expected;
        if (passed) passedCount++;

        results.push({
          testcase: i + 1,
          input: testcase.stdin,
          expectedOutput: testcase.expectedOutput,
          stdout: result.stdout,
          stderr: result.stderr,
          compileOutput: result.compile_output,
          verdict,
          runtime: result.time ? parseFloat(result.time) * 1000 : null,
          memory: result.memory,
          ...(typeof result.exit_code === "number"
            ? { exitCode: result.exit_code }
            : {}),
        });
      }

      return {
        totalTestcases: testcases.length,
        passedCount,
        results,
      };
    } catch (error) {
      logger.error(`Error processing run job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

runWorker.on("ready", () => {
  logger.info("🚀 Run worker is ready");
});

runWorker.on("error", (err) => {
  logger.error("❌ Run worker error:", err);
});

runWorker.on("completed", (job) => {
  logger.info(`Run job ${job.id} completed`);
});

runWorker.on("failed", (job, err) => {
  logger.error(`Run job ${job?.id} failed:`, err);
});
