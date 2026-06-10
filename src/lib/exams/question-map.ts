// Question Map — Maps exam IDs to their question banks
import { aiWorkflowQuestions } from './ai-workflow-questions';
import { vibeCodingQuestions } from './vibe-coding-questions';
import { aiAgentFundamentalsQuestions } from './ai-agent-fundamentals-questions';

export interface MCQQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

// Maps exam.id → question array
export const questionBank: Record<string, MCQQuestion[]> = {
  'ai-agent-workflow': aiWorkflowQuestions,
  'vibe-coding': vibeCodingQuestions,
  'ai-agent-fundamentals': aiAgentFundamentalsQuestions,
};
