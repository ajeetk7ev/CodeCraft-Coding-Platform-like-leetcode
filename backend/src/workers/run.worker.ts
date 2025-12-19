import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { submitToJudge0, pollJudge0Result, mapJudge0StatusToVerdict } from "../utils/judge0";
import { SupportedLanguage } from "../models/submission/Language";

interface RunJobData {
  code: string;
  language: SupportedLanguage;
  stdin?: string;
  expectedOutput?: string;
}

interface RunJobResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  verdict: string;
  runtime: number | null;
  memory: number | null;
  exitCode?: number | undefined;
}

export const runWorker = new Worker<RunJobData, RunJobResult>(
  "code-run",
  async (job: Job<RunJobData, RunJobResult>) => {
    console.log("CODE RUN DATA", job.data);
    const { code, language, stdin, expectedOutput } = job.data;

    try {
      // Submit code to Judge0
      const token = await submitToJudge0(code, language, stdin, expectedOutput);

      // Poll for result
      const result = await pollJudge0Result(token);

      // Map Judge0 result to our format
      const verdict = mapJudge0StatusToVerdict(result.status.id);

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        verdict: verdict,
        runtime: result.time ? parseFloat(result.time) * 1000 : null, // Convert to milliseconds
        memory: result.memory,
        exitCode: result.exit_code ?? undefined,
      };
    } catch (error: any) {
      console.error(`Error processing run job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 jobs concurrently
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




