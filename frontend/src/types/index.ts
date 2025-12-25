

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
