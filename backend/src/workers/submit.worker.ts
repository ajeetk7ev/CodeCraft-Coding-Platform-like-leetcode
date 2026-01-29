import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import Submission from "../models/submission/Submission";
import { ProblemTestcase } from "../models/problem/ProblemTestcase";
import { ProblemStats } from "../models/problem/ProblemStats";
import {
  submitToJudge0,
  pollJudge0Result,
  mapJudge0StatusToVerdict,
} from "../utils/judge0";
import { SupportedLanguage } from "../models/submission/Language";
import { Verdict } from "../models/submission/verdict";
import { SubmissionStatus } from "../models/submission/SubmissionStatus";
import { Stats } from "../models/user/Stats";
import { RecentSubmission } from "../models/user/RecentSubmission";
import { Problem } from "../models/problem/Problem";
import { updateUserStreak } from "../utils/streak.utils";
import { getIO } from "../config/socket";
import { Contest } from "../models/contest/Contest";
import { ContestParticipant } from "../models/contest/ContestParticipant";
import { logger } from "../utils/logger";

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

      // Sequential execution with early exit
      const testcaseResults = [];
      let shouldContinue = true;
      let executedCount = 0;
      let totalRuntime = 0;
      let maxMemory = 0;
      let finalVerdict: Verdict = Verdict.ACCEPTED;

      // Process test cases one by one with early exit
      for (let i = 0; i < testcases.length && shouldContinue; i++) {
        const testcase = testcases[i];
        if (!testcase) continue;

        try {
          // Submit single test case
          const token = await submitToJudge0(
            code,
            language,
            testcase.input,
            testcase.output,
            2, // cpuTimeLimit
            128000, // memoryLimit
          );

          // Poll for result
          const result = await pollJudge0Result(token);

          // Map verdict
          const verdict = mapJudge0StatusToVerdict(result.status.id);
          const passed = verdict === Verdict.ACCEPTED;

          executedCount++;

          // Accumulate runtime and memory
          const runtime = result.time ? parseFloat(result.time) * 1000 : 0;
          const memory = result.memory || 0;
          totalRuntime += runtime;
          maxMemory = Math.max(maxMemory, memory);

          // Store testcase result
          testcaseResults.push({
            input: testcase.isHidden ? undefined : testcase.input,
            expectedOutput: testcase.isHidden ? undefined : testcase.output,
            userOutput:
              result.stdout || result.stderr || result.compile_output || null,
            passed,
            runtime,
            memory,
          });

          // EARLY EXIT: Stop if test case failed
          if (!passed) {
            shouldContinue = false;
            finalVerdict = verdict; // WA, TLE, MLE, RE, etc.
            logger.info(
              `⚠️ Test case ${i + 1} failed with verdict: ${verdict}. Stopping execution.`,
            );
          }
        } catch (error: any) {
          logger.error(`Error processing testcase ${i + 1}:`, error);
          shouldContinue = false;
          finalVerdict = Verdict.INTERNAL_ERROR;
          executedCount++;

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

      // Mark remaining test cases as SKIPPED
      for (let i = executedCount; i < testcases.length; i++) {
        testcaseResults.push({
          input: undefined,
          expectedOutput: undefined,
          userOutput: "SKIPPED - Previous test case failed",
          passed: false,
          runtime: 0,
          memory: 0,
        });
      }

      // Get submission data (we need the user ID)
      const submission = await Submission.findById(submissionId);
      if (!submission) throw new Error("Submission not found");

      if (finalVerdict === Verdict.ACCEPTED) {
        // Update user stats and streak
        const userId = submission.user;
        const problem = await Problem.findById(problemId);
        if (problem) {
          const problemDifficulty = problem.difficulty;

          // Check if user has already solved this problem
          const existingRecentSubmission = await RecentSubmission.findOne({
            user: userId,
            problem: problemId,
            status: "Accepted",
          });

          // Only update solve counts if this is the first time solving this problem
          if (!existingRecentSubmission) {
            await Stats.findOneAndUpdate(
              { user: userId },
              {
                $inc: {
                  totalSolved: 1,
                  [problemDifficulty + "Solved"]: 1,
                },
              },
              { new: true, upsert: true },
            );
          }

          // Update user streak
          await updateUserStreak(String(userId));

          // Add/update recent submissions (always update timestamp)
          await RecentSubmission.findOneAndUpdate(
            { user: userId, problem: problemId },
            {
              status: "Accepted",
              submittedAt: new Date(),
            },
            { upsert: true, new: true },
          );
        }

        // Contest handling
        if (submission.contest) {
          logger.info(
            `Processing contest submission: contestId=${submission.contest}, userId=${submission.user}, verdict=${finalVerdict}`,
          );
          const participant = await ContestParticipant.findOne({
            user: submission.user,
            contest: submission.contest,
          });

          const contest = await Contest.findById(submission.contest);

          if (contest && participant) {
            const alreadySolved = participant.solvedProblems.some(
              (p) => String(p) === String(submission.problem),
            );

            if (finalVerdict === Verdict.ACCEPTED) {
              if (!alreadySolved) {
                participant.solvedProblems.push(submission.problem as any);

                const problem = await Problem.findById(submission.problem);
                // 1. Difficulty-based points
                const pointsMap: Record<string, number> = {
                  easy: 100,
                  medium: 200,
                  hard: 300,
                };
                const scoreToAdd =
                  (problem && pointsMap[problem.difficulty]) || 100;
                participant.score += scoreToAdd;

                // 2. Penalty calculation
                const contestStart =
                  participant.isVirtual && participant.virtualStartTime
                    ? new Date(participant.virtualStartTime)
                    : new Date(contest.startTime);

                const solveTime = new Date(submission.createdAt);
                const diffMinutes = Math.floor(
                  (solveTime.getTime() - contestStart.getTime()) / (1000 * 60),
                );

                // Find failed attempts for this problem before this AC
                const attemptInfo = participant.attempts.find(
                  (a) => String(a.problem) === String(submission.problem),
                );
                const failedAttemptsCount = attemptInfo
                  ? attemptInfo.failedCount
                  : 0;

                // Penalty = time to solve (minutes) + 5 minutes for each wrong submission
                participant.penalty +=
                  Math.max(0, diffMinutes) + failedAttemptsCount * 5;

                participant.lastSolvedAt = solveTime;
                await participant.save();

                // Update user's global contest points in Stats
                await Stats.findOneAndUpdate(
                  { user: submission.user },
                  { $inc: { contestPoints: scoreToAdd } },
                  { upsert: true },
                );
              }
            } else if (
              finalVerdict !== Verdict.COMPILE_ERROR &&
              !alreadySolved
            ) {
              // Track failed attempts (excluding compile errors, as per standard CP)
              let attemptInfo = participant.attempts.find(
                (a) => String(a.problem) === String(submission.problem),
              );
              if (attemptInfo) {
                attemptInfo.failedCount += 1;
              } else {
                participant.attempts.push({
                  problem: submission.problem as any,
                  failedCount: 1,
                });
              }
              await participant.save();
            }

            // 3. Throttled Broadcast update
            const io = getIO();
            if (io) {
              const cooldownKey = `leaderboard_cooldown_${submission.contest}`;
              const isOnCooldown = await redis.get(cooldownKey);

              if (!isOnCooldown) {
                const leaderboard = await ContestParticipant.find({
                  contest: submission.contest,
                })
                  .populate("user", "username avatar rating")
                  .sort({ score: -1, penalty: 1, lastSolvedAt: 1 })
                  .limit(100);

                io.to(`contest_${submission.contest}`).emit(
                  "leaderboard_update",
                  leaderboard,
                );
                await redis.set(cooldownKey, "true", "EX", 5);
              }
            }
          }
        }
      }

      // Update submission with results AND mark as COMPLETED
      await Submission.findByIdAndUpdate(submissionId, {
        verdict: finalVerdict,
        status: SubmissionStatus.COMPLETED,
        totalRuntime: Math.round(totalRuntime),
        totalMemory: maxMemory,
        testcaseResults,
      });

      // Update problem stats
      const stats = await ProblemStats.findOne({ problem: problemId });
      if (stats) {
        stats.totalSubmissions += 1;
        if (finalVerdict === Verdict.ACCEPTED) {
          stats.acceptedSubmissions += 1;
        }
        await stats.save();
      }

      logger.info(
        `Submission ${submissionId} completed with verdict: ${finalVerdict}`,
      );
    } catch (error: any) {
      logger.error(`Error processing submit job ${job.id}:`, error);

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
  },
);

submitWorker.on("ready", () => {
  logger.info("🚀 Submit worker is ready");
});

submitWorker.on("error", (err) => {
  logger.error("❌ Submit worker error:", err);
});

submitWorker.on("completed", (job) => {
  logger.info(`Submit job ${job.id} completed`);
});

submitWorker.on("failed", (job, err) => {
  logger.error(`Submit job ${job?.id} failed:`, err);
});
