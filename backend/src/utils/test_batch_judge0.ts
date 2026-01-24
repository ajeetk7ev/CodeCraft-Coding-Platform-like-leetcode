import { submitBatchToJudge0, pollBatchJudge0Results } from "./judge0_self";
import { logger } from "./logger";
import { SupportedLanguage } from "../models/submission/Language";
import dotenv from "dotenv";
import path from "path";

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function testBatchJudge0() {
  console.log("Testing Batch Judge0 Submissions...");

  const submissions = [
    {
      code: 'console.log("Hello 1");',
      language: SupportedLanguage.JAVASCRIPT,
      stdin: "",
      expectedOutput: "Hello 1",
    },
    {
      code: 'console.log("Hello 2");',
      language: SupportedLanguage.JAVASCRIPT,
      stdin: "",
      expectedOutput: "Hello 2",
    },
    {
      code: 'print("Hello Python")',
      language: SupportedLanguage.PYTHON,
      stdin: "",
      expectedOutput: "Hello Python",
    },
  ];

  try {
    logger.info("Submitting batch...");
    const tokens = await submitBatchToJudge0(submissions);
    logger.info(`Tokens received: ${tokens}`);

    logger.info("Polling for results...");
    const results = await pollBatchJudge0Results(tokens);

    results.forEach((result, index) => {
      logger.info(`Result ${index + 1}:`);
      logger.info(`- Status: ${result.status?.description}`);
      logger.info(`- Output: ${result.stdout?.trim()}`);
      logger.info(`- Expected: ${submissions[index]?.expectedOutput}`);
      logger.info(
        `- Match: ${result.stdout?.trim() === submissions[index]?.expectedOutput ? "✅" : "❌"}`,
      );
    });

    const allSuccessful = results.every((r) => r.status?.id === 3);
    if (allSuccessful) {
      logger.info("✅ Batch test successful!");
    } else {
      logger.info("❌ Some testcases failed or had unexpected results.");
    }
  } catch (error: any) {
    logger.error("❌ Batch test failed:");
    if (error.response) {
      logger.error(`- Status: ${error.response.status}`);
      logger.error(`- Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      logger.error(`- Message: ${error.message}`);
    }
  }
}

testBatchJudge0();
