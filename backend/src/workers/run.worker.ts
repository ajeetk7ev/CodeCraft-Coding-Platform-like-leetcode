import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { submitToJudge0, pollJudge0Result, mapJudge0StatusToVerdict } from "../utils/judge0";
import { SupportedLanguage } from "../models/submission/Language";

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
      const results: SingleTestcaseResult[] = [];
      let passedCount = 0;

      for (let i = 0; i < testcases.length; i++) {
        const testcase = testcases[i];
        if (!testcase) continue;

        const { stdin, expectedOutput } = testcase;

        const token = await submitToJudge0(
          code,
          language,
          stdin,
          expectedOutput
        );

        const result = await pollJudge0Result(token);
        const verdict = mapJudge0StatusToVerdict(result.status.id);

        const output = result.stdout?.trim() ?? "";
        const expected = expectedOutput.trim();

        const passed =
          verdict === "ACCEPTED" && output === expected;

        if (passed) passedCount++;

        results.push({
          testcase: i + 1,
          input: stdin,
          expectedOutput,
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
      console.error(`Error processing run job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);


runWorker.on("ready", () => {
  console.log("🚀 Run worker is ready");
});

runWorker.on("error", (err) => {
  console.error("❌ Run worker error:", err);
});

runWorker.on("completed", (job) => {
  console.log(`Run job ${job.id} completed`);
});

runWorker.on("failed", (job, err) => {
  console.error(`Run job ${job?.id} failed:`, err);
});




