import axios from "axios";
import { SupportedLanguage } from "../models/submission/Language";
import { Verdict } from "../models/submission/verdict";

/**
 * Judge0 Self-Hosted Integration
 * 
 * This module provides integration with a self-hosted Judge0 instance.
 * 
 * Features:
 * - Single and batch code submission
 * - Automatic base64 encoding/decoding
 * - Result polling with timeout protection
 * - Support for multiple programming languages
 * 
 * Batch Submission API:
 * - submitBatchToJudge0(): Submit multiple test cases in one request
 * - getBatchJudge0Results(): Fetch results for multiple submissions
 * - pollBatchJudge0Results(): Poll until all submissions complete
 * 
 * Single Submission API (legacy):
 * - submitToJudge0(): Submit a single test case
 * - getJudge0Result(): Fetch a single result
 * - pollJudge0Result(): Poll a single submission
 */

// Judge0 Self-Hosted API configuration
const JUDGE0_API_URL = process.env.JUDGE0_URL || "http://168.231.120.37:2358";

// Language ID mapping for Judge0
export const LANGUAGE_ID_MAP: Record<SupportedLanguage, number> = {
    [SupportedLanguage.CPP]: 54, // C++ (GCC 9.2.0)
    [SupportedLanguage.PYTHON]: 92, // Python (3.8.1)
    [SupportedLanguage.JAVASCRIPT]: 93, // Node.js (12.14.0)
    [SupportedLanguage.JAVA]: 91, // Java (OpenJDK 13.0.1)
    [SupportedLanguage.GO]: 60, // Go (1.13.5)
};

interface Judge0Submission {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
    cpu_time_limit?: number;
    memory_limit?: number;
}

interface Judge0Response {
    token: string;
}

export interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    status: {
        id: number;
        description: string;
    };
    time: string | null;
    memory: number | null;
    exit_code?: number;
    exit_signal?: number;
}

interface BatchJudge0Results {
    submissions: Judge0Result[];
}

// ---------- helpers ----------
const encodeBase64 = (value?: string) =>
    value ? Buffer.from(value, "utf-8").toString("base64") : undefined;

const decodeBase64 = (value?: string | null) =>
    value ? Buffer.from(value, "base64").toString("utf-8") : null;

// Create headers for Judge0 API
const getHeaders = () => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    return headers;
};

/**
 * Submit code to Judge0 for execution
 */
export const submitToJudge0 = async (
    code: string,
    language: SupportedLanguage,
    stdin?: string,
    expectedOutput?: string,
    cpuTimeLimit: number = 2,
    memoryLimit: number = 128000 // 128MB in KB
): Promise<string> => {
    try {
        const languageId = LANGUAGE_ID_MAP[language];
        if (!languageId) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const submission: Judge0Submission = {
            source_code: encodeBase64(code)!,
            language_id: languageId,
            cpu_time_limit: cpuTimeLimit,
            memory_limit: memoryLimit,
        };

        if (stdin) {
            submission.stdin = encodeBase64(stdin)!;
        }

        if (expectedOutput) {
            submission.expected_output = encodeBase64(expectedOutput)!;
        }

        const response = await axios.post<Judge0Response>(
            `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
            submission,
            { headers: getHeaders() }
        );

        return response.data.token;
    } catch (error: any) {
        console.error("Error submitting to Judge0 (Self-Hosted):", error);
        throw new Error(`Failed to submit code to Judge0 (Self-Hosted): ${error.message}`);
    }
};

/**
 * Submit multiple codes to Judge0 for execution in batch
 */
export const submitBatchToJudge0 = async (
    submissions: Array<{
        code: string;
        language: SupportedLanguage;
        stdin?: string;
        expectedOutput?: string;
        cpuTimeLimit?: number;
        memoryLimit?: number;
    }>
): Promise<string[]> => {
    try {
        const batchSubmissions: Judge0Submission[] = submissions.map((sub) => {
            const languageId = LANGUAGE_ID_MAP[sub.language];
            if (!languageId) {
                throw new Error(`Unsupported language: ${sub.language}`);
            }

            const submission: Judge0Submission = {
                source_code: encodeBase64(sub.code)!,
                language_id: languageId,
                cpu_time_limit: sub.cpuTimeLimit || 2,
                memory_limit: sub.memoryLimit || 128000,
            };

            if (sub.stdin && sub.stdin.trim() !== "") {
                submission.stdin = encodeBase64(sub.stdin)!;
            }

            if (sub.expectedOutput && sub.expectedOutput.trim() !== "") {
                submission.expected_output = encodeBase64(sub.expectedOutput)!;
            }

            return submission;
        });

        // Some Judge0 versions expect { submissions: [...] }, some expect [...]
        // Based on docs, it should be { submissions: [...] }
        const response = await axios.post<{ token: string }[]>(
            `${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`,
            { submissions: batchSubmissions },
            { headers: getHeaders() }
        );

        return response.data.map((res) => res.token);
    } catch (error: any) {
        console.error("Error submitting batch to Judge0 (Self-Hosted):");
        if (error.response) {
            console.error("- Status:", error.response.status);
            console.error("- Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("- Message:", error.message);
        }
        throw new Error(`Failed to submit batch to Judge0 (Self-Hosted): ${error.message}`);
    }
};

/**
 * Get result from Judge0 using token
 */
export const getJudge0Result = async (token: string): Promise<Judge0Result> => {
    try {
        const response = await axios.get<Judge0Result>(
            `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
            { headers: getHeaders() }
        );

        return {
            ...response.data,
            stdout: decodeBase64(response.data.stdout),
            stderr: decodeBase64(response.data.stderr),
            compile_output: decodeBase64(response.data.compile_output),
            message: decodeBase64(response.data.message),
        };
    } catch (error: any) {
        console.error("Error fetching Judge0 result (Self-Hosted):", error);
        throw new Error(`Failed to fetch result from Judge0 (Self-Hosted): ${error.message}`);
    }
};

/**
 * Get multiple results from Judge0 using tokens in batch
 */
export const getBatchJudge0Results = async (tokens: string[]): Promise<Judge0Result[]> => {
    try {
        const response = await axios.get<BatchJudge0Results>(
            `${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true`,
            { headers: getHeaders() }
        );

        // API might return { submissions: [...] }
        const submissions = response.data.submissions || (response.data as unknown as Judge0Result[]);

        return submissions.map((res) => ({
            ...res,
            stdout: decodeBase64(res.stdout),
            stderr: decodeBase64(res.stderr),
            compile_output: decodeBase64(res.compile_output),
            message: decodeBase64(res.message),
        }));
    } catch (error: any) {
        console.error("Error fetching batch Judge0 results (Self-Hosted):", error);
        throw new Error(`Failed to fetch batch results from Judge0 (Self-Hosted): ${error.message}`);
    }
};

/**
 * Poll Judge0 result until it's ready
 */
export const pollJudge0Result = async (
    token: string,
    maxAttempts: number = 30,
    delayMs: number = 1000
): Promise<Judge0Result> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await getJudge0Result(token);

        if (result.status.id > 2) {
            return result;
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error("Timeout waiting for Judge0 result (Self-Hosted)");
};

/**
 * Poll multiple Judge0 results until they are all ready
 */
export const pollBatchJudge0Results = async (
    tokens: string[],
    maxAttempts: number = 30,
    delayMs: number = 1000
): Promise<Judge0Result[]> => {
    let pendingTokens = [...tokens];
    const resultsMap: Record<string, Judge0Result> = {};

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (pendingTokens.length === 0) break;

        const results = await getBatchJudge0Results(pendingTokens);

        const remainingTokens: string[] = [];
        results.forEach((result, index) => {
            const token = pendingTokens[index];
            if (token && result.status.id > 2) {
                resultsMap[token] = result;
            } else if (token) {
                remainingTokens.push(token);
            }
        });

        pendingTokens = remainingTokens;

        if (pendingTokens.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    if (pendingTokens.length > 0) {
        // Fetch whatever we have for the remaining ones
        const results = await getBatchJudge0Results(pendingTokens);
        results.forEach((result, index) => {
            const token = pendingTokens[index];
            if (token) {
                resultsMap[token] = result;
            }
        });
    }

    // Return results in the original order of tokens
    return tokens.map(token => resultsMap[token]!);
};

/**
 * Map Judge0 status to our Verdict enum
 */
export const mapJudge0StatusToVerdict = (statusId: number): Verdict => {
    switch (statusId) {
        case 3: // Accepted
            return Verdict.ACCEPTED;
        case 4: // Wrong Answer
            return Verdict.WRONG_ANSWER;
        case 5: // Time Limit Exceeded
            return Verdict.TLE;
        case 6: // Compilation Error
            return Verdict.COMPILE_ERROR;
        case 7: // Runtime Error (SIGSEGV)
        case 8: // Runtime Error (SIGXFSZ)
        case 9: // Runtime Error (SIGFPE)
        case 10: // Runtime Error (SIGABRT)
        case 11: // Runtime Error (NZEC)
        case 12: // Runtime Error (Other)
            return Verdict.RUNTIME_ERROR;
        case 13: // Internal Error
            return Verdict.INTERNAL_ERROR;
        default:
            return Verdict.INTERNAL_ERROR;
    }
};
