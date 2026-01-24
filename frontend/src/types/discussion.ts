export interface IAuthor {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
}

export interface IDiscussion {
  _id: string;
  title: string;
  content: string;
  author: IAuthor;
  category:
    | "General"
    | "Interview Question"
    | "Interview Experience"
    | "Career"
    | "Feedback"
    | "Support";
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  content: string;
  author: IAuthor;
  discussion: string;
  parentComment?: string | null;
  replies: IComment[];
  upvotes: number;
  downvotes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoteData {
  targetId: string;
  targetType: "Discussion" | "Comment";
  voteType: 1 | -1;
}
