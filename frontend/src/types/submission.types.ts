export type TestcaseInput = {
  stdin: string;
  expectedOutput: string;
};

export type RunRequest = {
  slug:string;
  code: string;
  language: string;
  testcases: TestcaseInput[];
};

export type SubmitRequest = {
  problemId:string;
  code:string;
  language:string;
}

export type TestcaseResult = {
  testcase: number;
  input: string;
  expectedOutput: string;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  verdict: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "COMPILE_ERROR";
  runtime: number;
  memory: number;
};

export type RunResponse = {
  totalTestcases: number;
  passedCount: number;
  results: TestcaseResult[];
};
