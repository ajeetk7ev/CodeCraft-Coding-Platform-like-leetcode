

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;

  gender?: string;
  github?: string;
  linkedin?: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  currentStreak?: number;
  longestStreak?: number;
  contestPoints?: number;
  rating?: number;
  ratingHistory?: {
    rating: number;
    date: Date;
    contestId?: string;
  }[];
}

export interface UserStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  rank?: number;
  totalQuestions?: number;
}

export interface SubmissionActivity {
  date: string;
  status: string;
}

export interface RecentProblem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  date: string;
}

export interface ProfileData {
  user: User;
  stats: UserStats;
  submissions: SubmissionActivity[];
  recentProblems: RecentProblem[];
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

export interface Preferences {
  defaultLanguage: string;
  theme: string;
  fontSize: number;
  tabSize: number;
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

  preferences: Preferences;
  isSolved?: boolean;
}
