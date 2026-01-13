import { submitBatchToJudge0, pollBatchJudge0Results } from "./judge0_self";
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
            expectedOutput: "Hello 1"
        },
        {
            code: 'console.log("Hello 2");',
            language: SupportedLanguage.JAVASCRIPT,
            stdin: "",
            expectedOutput: "Hello 2"
        },
        {
            code: 'print("Hello Python")',
            language: SupportedLanguage.PYTHON,
            stdin: "",
            expectedOutput: "Hello Python"
        }
    ];

    try {
        console.log("Submitting batch...");
        const tokens = await submitBatchToJudge0(submissions);
        console.log("Tokens received:", tokens);

        console.log("Polling for results...");
        const results = await pollBatchJudge0Results(tokens);

        results.forEach((result, index) => {
            console.log(`Result ${index + 1}:`);
            console.log(`- Status: ${result.status?.description}`);
            console.log(`- Output: ${result.stdout?.trim()}`);
            console.log(`- Expected: ${submissions[index]?.expectedOutput}`);
            console.log(`- Match: ${result.stdout?.trim() === submissions[index]?.expectedOutput ? '✅' : '❌'}`);
        });

        const allSuccessful = results.every(r => r.status?.id === 3);
        if (allSuccessful) {
            console.log("✅ Batch test successful!");
        } else {
            console.log("❌ Some testcases failed or had unexpected results.");
        }
    } catch (error: any) {
        console.error("❌ Batch test failed:");
        if (error.response) {
            console.error("- Status:", error.response.status);
            console.error("- Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("- Message:", error.message);
        }
    }
}

testBatchJudge0();
