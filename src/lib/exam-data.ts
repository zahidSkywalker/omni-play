export interface Exam {
  id: string;
  title: string;
  description: string;
  category: ExamCategory;
  questionCount: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  tags: string[];
}

export type ExamCategory =
  | 'ai'
  | 'webdev'
  | 'devops'
  | 'cybersecurity'
  | 'database'
  | 'prompt-engineering'
  | 'general'
  | 'agent-workflow'
  | 'vibe-coding';

export const exams: Exam[] = [
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'Test your knowledge of artificial intelligence concepts, machine learning basics, and neural networks.',
    category: 'ai',
    questionCount: 25,
    duration: '30 min',
    difficulty: 'Beginner',
    icon: '🧠',
    tags: ['AI', 'Machine Learning', 'Neural Networks'],
  },
  {
    id: 'prompt-engineering-basics',
    title: 'Prompt Engineering Mastery',
    description: 'Master the art of crafting effective prompts for AI models. Learn techniques for better outputs.',
    category: 'prompt-engineering',
    questionCount: 20,
    duration: '25 min',
    difficulty: 'Intermediate',
    icon: '✨',
    tags: ['Prompts', 'LLM', 'GPT'],
  },
  {
    id: 'webdev-html-css',
    title: 'HTML & CSS Deep Dive',
    description: 'From semantic HTML to advanced CSS layouts, Grid, Flexbox, animations and responsive design patterns.',
    category: 'webdev',
    questionCount: 30,
    duration: '35 min',
    difficulty: 'Beginner',
    icon: '🌐',
    tags: ['HTML', 'CSS', 'Responsive'],
  },
  {
    id: 'webdev-javascript',
    title: 'JavaScript Essentials',
    description: 'Core JS concepts including closures, prototypes, async/await, ES6+ features, and DOM manipulation.',
    category: 'webdev',
    questionCount: 30,
    duration: '35 min',
    difficulty: 'Intermediate',
    icon: '⚡',
    tags: ['JavaScript', 'ES6+', 'Async'],
  },
  {
    id: 'webdev-react',
    title: 'React & Next.js',
    description: 'Component architecture, hooks, server components, App Router, and modern React patterns.',
    category: 'webdev',
    questionCount: 25,
    duration: '30 min',
    difficulty: 'Intermediate',
    icon: '⚛️',
    tags: ['React', 'Next.js', 'Hooks'],
  },
  {
    id: 'devops-docker',
    title: 'DevOps & Docker',
    description: 'Containerization, CI/CD pipelines, Docker compose, and modern DevOps practices for deployment.',
    category: 'devops',
    questionCount: 20,
    duration: '25 min',
    difficulty: 'Intermediate',
    icon: '🐳',
    tags: ['Docker', 'CI/CD', 'Containers'],
  },
  {
    id: 'devops-cloud',
    title: 'Cloud Computing',
    description: 'AWS, GCP, Azure fundamentals — compute, storage, networking, and serverless architecture patterns.',
    category: 'devops',
    questionCount: 20,
    duration: '25 min',
    difficulty: 'Advanced',
    icon: '☁️',
    tags: ['AWS', 'Cloud', 'Serverless'],
  },
  {
    id: 'cybersecurity-basics',
    title: 'Cybersecurity Essentials',
    description: 'Network security, encryption, threat modeling, OWASP top 10, and security best practices.',
    category: 'cybersecurity',
    questionCount: 25,
    duration: '30 min',
    difficulty: 'Beginner',
    icon: '🔒',
    tags: ['Security', 'Encryption', 'OWASP'],
  },
  {
    id: 'database-sql',
    title: 'SQL & Database Design',
    description: 'SQL queries, database normalization, indexing strategies, and relational database design principles.',
    category: 'database',
    questionCount: 25,
    duration: '30 min',
    difficulty: 'Intermediate',
    icon: '🗄️',
    tags: ['SQL', 'PostgreSQL', 'Design'],
  },
  {
    id: 'database-nosql',
    title: 'NoSQL & Modern Databases',
    description: 'MongoDB, Redis, graph databases, and choosing the right database for your application.',
    category: 'database',
    questionCount: 20,
    duration: '25 min',
    difficulty: 'Advanced',
    icon: '📊',
    tags: ['MongoDB', 'Redis', 'NoSQL'],
  },
  {
    id: 'ai-deep-learning',
    title: 'Deep Learning & Neural Networks',
    description: 'CNNs, RNNs, transformers, training strategies, and practical deep learning implementation.',
    category: 'ai',
    questionCount: 30,
    duration: '40 min',
    difficulty: 'Advanced',
    icon: '🔬',
    tags: ['Deep Learning', 'Transformers', 'PyTorch'],
  },
  {
    id: 'general-tech',
    title: 'Tech Industry Knowledge',
    description: 'General technology trends, software engineering practices, system design, and tech culture.',
    category: 'general',
    questionCount: 20,
    duration: '25 min',
    difficulty: 'Beginner',
    icon: '💡',
    tags: ['Tech', 'Industry', 'System Design'],
  },
  {
    id: 'ai-agent-workflow',
    title: 'এআই এজেন্ট ও ওয়ার্কফ্লো',
    description: 'লোকাল LLM চালানো, Ollama, LM Studio, অফলাইন এজেন্ট তৈরি এবং মাল্টি-এজেন্ট সিস্টেম নিয়ে বাংলায় ৫০টি প্রশ্ন।',
    category: 'agent-workflow',
    questionCount: 50,
    duration: '30 min',
    difficulty: 'Intermediate',
    icon: '🤖',
    tags: ['AI Agent', 'Ollama', 'LM Studio', 'Offline Agent'],
  },
  {
    id: 'vibe-coding',
    title: 'ভাইব কোডিং',
    description: 'প্রম্পট ইঞ্জিনিয়ারিং, ফুল-স্ট্যাক অ্যাপ ডেভেলপমেন্ট, ডিবাগিং এবং টেস্টিং নিয়ে বাংলায় ৫০টি প্রশ্ন।',
    category: 'vibe-coding',
    questionCount: 50,
    duration: '30 min',
    difficulty: 'Intermediate',
    icon: '💻',
    tags: ['Vibe Coding', 'Prompt', 'Full-Stack', 'AI'],
  },
  {
    id: 'ai-agent-fundamentals',
    title: 'এআই এজেন্ট ফাউন্ডেশন',
    description: 'এআই এজেন্টের মৌলিক ধারণা, আর্কিটেকচার, ওয়ার্কফ্লো, ফ্রেমওয়ার্ক এবং সেফটি গার্ডরেইল নিয়ে বাংলায় ৫০টি প্রশ্ন।',
    category: 'ai',
    questionCount: 50,
    duration: '30 min',
    difficulty: 'Beginner',
    icon: '🧠',
    tags: ['AI Agent', 'Agentic', 'ReAct', 'LangChain'],
  },
];

export const categoryLabels: Record<ExamCategory, string> = {
  ai: 'Artificial Intelligence',
  webdev: 'Web Development',
  devops: 'DevOps & Cloud',
  cybersecurity: 'Cybersecurity',
  database: 'Databases',
  'prompt-engineering': 'Prompt Engineering',
  general: 'General Tech',
  'agent-workflow': 'AI Agent & Workflow',
  'vibe-coding': 'Vibe Coding',
};

export const categoryColors: Record<ExamCategory, { bg: string; border: string; text: string; glow: string }> = {
  ai: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  webdev: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  devops: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  cybersecurity: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
  database: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  'prompt-engineering': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  general: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', glow: 'shadow-teal-500/20' },
  'agent-workflow': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
  'vibe-coding': { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'shadow-pink-500/20' },
};
