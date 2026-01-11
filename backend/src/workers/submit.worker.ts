import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import Submission from "../models/submission/Submission";
import { ProblemTestcase } from "../models/problem/ProblemTestcase";
import { ProblemStats } from "../models/problem/ProblemStats";
import { submitToJudge0, pollJudge0Result, mapJudge0StatusToVerdict } from "../utils/judge0";
import { SupportedLanguage } from "../models/submission/Language";
import { Verdict } from "../models/submission/verdict";
import { SubmissionStatus } from "../models/submission/SubmissionStatus";
import { Stats } from "../models/user/Stats";
import { RecentSubmission } from "../models/user/RecentSubmission";
import { Problem } from "../models/problem/Problem";

interface SubmitJobData {
  submissionId: string;
  code: string;
  language: SupportedLanguage;
  problemId: string;
}

export const submitWorker = new Worker<SubmitJobData, void>(
  "code-submit",
  async (job: Job<SubmitJobData, void>) => {
    const { submissionId, code, language, problemId } = job.data;

    try {
      // Update submission status to RUNNING
      await Submission.findByIdAndUpdate(submissionId, {
        status: SubmissionStatus.RUNNING,
      });

      // Fetch all testcases for the problem
      const testcases = await ProblemTestcase.find({ problem: problemId });

      if (testcases.length === 0) {
        throw new Error("No testcases found for this problem");
      }

      const testcaseResults = [];
      let allPassed = true;
      let totalRuntime = 0;
      let maxMemory = 0;
      let finalVerdict: Verdict = Verdict.ACCEPTED;

      // Process each testcase
      for (const testcase of testcases) {
        try {
          // Submit to Judge0
          const token = await submitToJudge0(
            code,
            language,
            testcase.input,
            testcase.output,
            2, // 2 seconds CPU time limit
            128000 // 128MB memory limit
          );

          // Poll for result
          const result = await pollJudge0Result(token);

          // Map verdict
          const verdict = mapJudge0StatusToVerdict(result.status.id);
          const passed = verdict === Verdict.ACCEPTED;

          // Update final verdict if testcase failed
          if (!passed && finalVerdict === Verdict.ACCEPTED) {
            finalVerdict = verdict;
          }

          if (!passed) {
            allPassed = false;
          }

          // Accumulate runtime and memory
          const runtime = result.time ? parseFloat(result.time) * 1000 : 0; // Convert to milliseconds
          const memory = result.memory || 0;
          totalRuntime += runtime;
          maxMemory = Math.max(maxMemory, memory);

          // Store testcase result
          testcaseResults.push({
            input: testcase.isHidden ? undefined : testcase.input,
            expectedOutput: testcase.isHidden ? undefined : testcase.output,
            userOutput: result.stdout || result.stderr || result.compile_output || null,
            passed,
            runtime,
            memory,
          });
        } catch (error: any) {
          console.error(`Error processing testcase ${testcase._id}:`, error);
          allPassed = false;
          finalVerdict = Verdict.INTERNAL_ERROR;
          testcaseResults.push({
            input: testcase.isHidden ? undefined : testcase.input,
            expectedOutput: testcase.isHidden ? undefined : testcase.output,
            userOutput: null,
            passed: false,
            runtime: 0,
            memory: 0,
          });
        }
      }

      // Determine final verdict
      if (allPassed) {
        finalVerdict = Verdict.ACCEPTED;
      } else if (testcaseResults.some((r) => r.passed)) {
        finalVerdict = Verdict.PARTIAL;
      }

      // Update submission with results
      await Submission.findByIdAndUpdate(submissionId, {
        verdict: finalVerdict,
        status: SubmissionStatus.COMPLETED,
        totalRuntime: Math.round(totalRuntime),
        totalMemory: maxMemory,
        testcaseResults,
      });

      // Get submission to access user and problem
      const submission = await Submission.findById(submissionId).populate('user problem');

      if (finalVerdict === Verdict.ACCEPTED && submission) {
        // Update user stats
        const userId = submission.user;
        const problemId = submission.problem;
        const problemDifficulty = (submission.problem as any).difficulty;

        // Check if user has already solved this problem
        const existingRecentSubmission = await RecentSubmission.findOne({
          user: userId,
          problem: problemId
        });

        // Only update stats if this is the first time solving this problem
        if (!existingRecentSubmission) {
          const stats = await Stats.findOneAndUpdate(
            { user: userId },
            {
              $inc: {
                totalSolved: 1,
                [problemDifficulty + 'Solved']: 1
              }
            },
            { new: true, upsert: true }
          );
        }

        // Add/update recent submissions (always update timestamp)
        await RecentSubmission.findOneAndUpdate(
          { user: userId, problem: problemId },
          {
            status: 'Accepted',
            submittedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }

      // Update problem stats
      const stats = await ProblemStats.findOne({ problem: problemId });
      if (stats) {
        stats.totalSubmissions += 1;
        if (finalVerdict === Verdict.ACCEPTED) {
          stats.acceptedSubmissions += 1;
        }
        await stats.save();
      }

      // Clear relevant caches since new submission data is now in DB
      const cachesToClear = [
        "leaderboard:top50",
        "admin:dashboard:stats",
        "admin:submissions:daily",
        "admin:ratio:ac-vs-wa",
        "admin:problems:most-solved"
      ];
      await redis.del(...cachesToClear);

      console.log(`Submission ${submissionId} completed with verdict: ${finalVerdict}`);
    } catch (error: any) {
      console.error(`Error processing submit job ${job.id}:`, error);

      // Update submission status to FAILED
      await Submission.findByIdAndUpdate(submissionId, {
        status: SubmissionStatus.FAILED,
        verdict: Verdict.INTERNAL_ERROR,
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

submitWorker.on("ready", () => {
  console.log("🚀 Submit worker is ready");
});

submitWorker.on("error", (err) => {
  console.error("❌ Submit worker error:", err);
});

submitWorker.on("completed", (job) => {
  console.log(`Submit job ${job.id} completed`);
});

submitWorker.on("failed", (job, err) => {
  console.error(`Submit job ${job?.id} failed:`, err);
});

