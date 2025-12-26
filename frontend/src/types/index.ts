

export interface User{
  id:string;
  username: string;
  fullName: string;
  email: string;
  
  gender?: "male" | "female" | "other";
  github?: string;
  linkedin?: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
}


export type Difficulty = "easy" | "medium" | "hard";

export interface Example {
  _id: string;
  input: string;
  output: string;
  explanation: string;
}

export interface Testcase {
  _id: string;
  input: string;
  output: string;
}

export interface Boilerplate {
  _id: string;
  language: string;
  userCodeTemplate: string;
}

export interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;

  description: string;
  constraints: string[];

  examples: Example[];
  testcases: Testcase[];
  boilerplates: Boilerplate[];

  tags: string[];
  companyTags: string[];
}
