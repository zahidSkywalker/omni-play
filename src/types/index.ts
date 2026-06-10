export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IExam {
  _id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  questions: IQuestion[];
  status: "active" | "closed" | "draft";
  createdAt: string;
  totalSubmissions: number;
  questionTimeLimit?: number;
}

export interface ISubmission {
  _id: string;
  examId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  submittedAt: string;
  studentName?: string;
  username: string;
  token: string;
}

export interface ExamFormData {
  title: string;
  description: string;
  duration: number;
  questions: IQuestion[];
}

export interface ExamSummary {
  _id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  questionCount: number;
  status: "active" | "closed" | "draft";
  createdAt: string;
  totalSubmissions: number;
}

// ─── User & Auth Types ──────────────────────────────────────

export type AuthProvider = "google" | "discord" | "anonymous";

export interface IUserStats {
  totalExams: number;
  totalScore: number;
  bestScore: number;
  streak: number;
  lastExamAt: string | null;
}

export interface IUser {
  _id: string;
  provider: AuthProvider;
  providerId: string;
  name: string;
  email?: string;
  avatar?: string;
  username: string;
  stats: IUserStats;
  badges: string[];
  bookmarks: string[];
  groups: string[];
  createdAt: string;
}

export interface ISubmissionWithExam extends ISubmission {
  examTitle?: string;
  userId?: string;
}

// ─── Group / Class Mode Types ──────────────────────────────

export interface IGroupMember {
  userId: string;
  username: string;
  joinedAt: string;
}

export interface IGroup {
  _id: string;
  name: string;
  code: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  members: IGroupMember[];
  examIds: string[];
  isActive: boolean;
  createdAt: string;
  memberCount: number; // for list views
}
