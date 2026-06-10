// AI Workflow Bangla MCQs - Module 3: Sessions 6-7
// Topic: Local LLM, Ollama, LM Studio, and Offline AI Agents

export interface MCQQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

export const aiWorkflowQuestions: MCQQuestion[] = [
  // ===================================================================
  // SESSION 6: Local LLM Running with Ollama and LM Studio (Q1-Q25)
  // ===================================================================

  {
    id: 1,
    question: "লোকাল LLM ব্যবহারের সবচেয়ে বড় সুবিধা কী?",
    options: [
      "ইন্টারনেট ছাড়াই কাজ করা যায়",
      "সবসময় ক্লাউড থেকে দ্রুত কাজ করে",
      "শুধুমাত্র বড় কোম্পানিগুলো ব্যবহার করতে পারে",
      "সব মডেল ফ্রি ডাউনলোড করা যায়"
    ],
    correctAnswer: 0,
    explanation: "লোকাল LLM ব্যবহার করলে ইন্টারনেট সংযোগ ছাড়াই কাজ করা সম্ভব কারণ মডেলটি ব্যবহারকারীর নিজের ডিভাইসে চলে।"
  },

  {
    id: 2,
    question: "লোকাল LLM চালানোর জন্য ন্যূনতম কত RAM প্রয়োজন?",
    options: [
      "২ GB",
      "৪ GB",
      "৮ GB",
      "১৬ GB"
    ],
    correctAnswer: 2,
    explanation: "লোকাল LLM চালানোর জন্য ন্যূনতম ৮GB RAM প্রয়োজন, তবে ভালো পারফরম্যান্সের জন্য আরও বেশি RAM সুবিধাজনক।"
  },

  {
    id: 3,
    question: "লোকাল LLM এর প্রাইভেসি সুবিধাটি কীভাবে কাজ করে?",
    options: [
      "ডেটা ক্লাউডে আপলোড হয়ে এনক্রিপ্টেড থাকে",
      "সব ডেটা ডিভাইসে থাকে, বাইরে যায় না",
      "ডেটা শুধু VPN এর মাধ্যমে পাঠানো হয়",
      "ডেটা সরকারি সার্ভারে সংরক্ষিত থাকে"
    ],
    correctAnswer: 1,
    explanation: "লোকাল LLM ব্যবহারে সমস্ত ডেটা ব্যবহারকারীর নিজের ডিভাইসে থাকে এবং কোনো বহিরাগত সার্ভারে পাঠানো হয় না, যা সর্বোচ্চ গোপনীয়তা নিশ্চিত করে।"
  },

  {
    id: 4,
    question: "Ollama কী ধরনের টুল?",
    options: [
      "একটি গ্রাফিকাল ডেস্কটপ অ্যাপ্লিকেশন",
      "একটি কমান্ড-লাইন টুল",
      "একটি ওয়েব ব্রাউজার এক্সটেনশন",
      "একটি মোবাইল অ্যাপ্লিকেশন"
    ],
    correctAnswer: 1,
    explanation: "Ollama মূলত একটি কমান্ড-লাইন টুল যা Docker ভিত্তিক এবং লোকাল LLM চালানোর জন্য ব্যবহৃত হয়।"
  },

  {
    id: 5,
    question: "Ollama দিয়ে কোনো মডেল চালানোর জন্য কোন কমান্ড ব্যবহার করা হয়?",
    options: [
      "ollama start [model]",
      "ollama run [model]",
      "ollama execute [model]",
      "ollama launch [model]"
    ],
    correctAnswer: 1,
    explanation: "\"ollama run [model]\" কমান্ড ব্যবহার করে নির্দিষ্ট কোনো মডেল Ollama তে চালানো যায়, যেমন: ollama run llama3।"
  },

  {
    id: 6,
    question: "Ollama তে ইনস্টল করা মডেলগুলোর তালিকা দেখতে কোন কমান্ড ব্যবহার করা হয়?",
    options: [
      "ollama models",
      "ollama show",
      "ollama list",
      "ollama installed"
    ],
    correctAnswer: 2,
    explanation: "\"ollama list\" কমান্ডটি ব্যবহার করলে বর্তমানে ইনস্টল করা সব মডেলের তালিকা দেখা যায়।"
  },

  {
    id: 7,
    question: "Llama 3 মডেলটি কোন কোম্পানি তৈরি করেছে?",
    options: [
      "Google",
      "Microsoft",
      "Meta",
      "Mistral AI"
    ],
    correctAnswer: 2,
    explanation: "Llama 3 মডেলটি Meta (Facebook) কোম্পানি তৈরি করেছে এবং এটি 8B এবং 70B প্যারামিটার সাইজে পাওয়া যায়।"
  },

  {
    id: 8,
    question: "Gemma 2 মডেলটি কোন প্রতিষ্ঠানের তৈরি?",
    options: [
      "Meta",
      "Google",
      "Microsoft",
      "OpenAI"
    ],
    correctAnswer: 1,
    explanation: "Gemma 2 মডেলটি Google তৈরি করেছে এবং এটি 2B, 9B, এবং 27B প্যারামিটার সাইজে উপলব্ধ।"
  },

  {
    id: 9,
    question: "Phi-3 মডেলটি কোন কোম্পানির তৈরি?",
    options: [
      "Google",
      "Meta",
      "Mistral AI",
      "Microsoft"
    ],
    correctAnswer: 3,
    explanation: "Phi-3 একটি ছোট কিন্তু কার্যকর মডেল যা Microsoft তৈরি করেছে এবং এর সাইজ ৩.৮ বিলিয়ন প্যারামিটার।"
  },

  {
    id: 10,
    question: "Ollama এর ডিফল্ট লোকাল API সার্ভার কোন পোর্টে চলে?",
    options: [
      "http://localhost:8080",
      "http://localhost:1234",
      "http://localhost:11434",
      "http://localhost:5000"
    ],
    correctAnswer: 2,
    explanation: "Ollama ইনস্টল করার পর স্বয়ংক্রিয়ভাবে http://localhost:11434 পোর্টে একটি লোকাল API সার্ভার চালু হয়।"
  },

  {
    id: 11,
    question: "Ollama এর API কোন ফরম্যাটের সাথে সামঞ্জস্যপূর্ণ (compatible)?",
    options: [
      "Google API ফরম্যাট",
      "Hugging Face API ফরম্যাট",
      "OpenAI API ফরম্যাট",
      "AWS API ফরম্যাট"
    ],
    correctAnswer: 2,
    explanation: "Ollama এর API OpenAI-compatible, যার মানে একই কোড ব্যবহার করে OpenAI এবং Ollama উভয়ের সাথে কাজ করা যায়।"
  },

  {
    id: 12,
    question: "LM Studio কী ধরনের অ্যাপ্লিকেশন?",
    options: [
      "কমান্ড-লাইন টুল",
      "ডেস্কটপ GUI অ্যাপ্লিকেশন",
      "ওয়েব-ভিত্তিক অ্যাপ্লিকেশন",
      "মোবাইল অ্যাপ্লিকেশন"
    ],
    correctAnswer: 1,
    explanation: "LM Studio একটি ডেস্কটপ GUI (গ্রাফিকাল ইউজার ইন্টারফেস) অ্যাপ্লিকেশন যা ব্যবহার করা অনেক সহজ।"
  },

  {
    id: 13,
    question: "LM Studio থেকে কোন প্ল্যাটফর্মে মডেল খুঁজে পাওয়া যায়?",
    options: [
      "Kaggle",
      "Hugging Face",
      "GitHub",
      "TensorFlow Hub"
    ],
    correctAnswer: 1,
    explanation: "LM Studio তে Hugging Face থেকে মডেল সার্চ ও ডাউনলোড করার সুবিধা আছে।"
  },

  {
    id: 14,
    question: "LM Studio কোন ফরম্যাটের মডেল ব্যবহার করে?",
    options: [
      "ONNX",
      "Safetensors",
      "GGUF",
      "TensorRT"
    ],
    correctAnswer: 2,
    explanation: "LM Studio GGUF (GPT-Generated Unified Format) ফরম্যাটের মডেল ব্যবহার করে যা লোকালে দক্ষভাবে চলার জন্য অপ্টিমাইজ করা।"
  },

  {
    id: 15,
    question: "LM Studio এর লোকাল সার্ভার কোন পোর্টে চলে?",
    options: [
      "http://localhost:8080",
      "http://localhost:11434",
      "http://localhost:1234",
      "http://localhost:3000"
    ],
    correctAnswer: 2,
    explanation: "LM Studio এর লোকাল সার্ভার http://localhost:1234 পোর্টে চলে এবং এটিও OpenAI-compatible API সাপোর্ট করে।"
  },

  {
    id: 16,
    question: "লোকাল GPU ক্লাউডের তুলনায় কোন ক্ষেত্রে সুবিধাজনক?",
    options: [
      "সবসময় ধীর কাজ করে",
      "API বিল বাঁচায় এবং স্পিড বেশি হতে পারে",
      "শুধু ছবি তৈরিতে ভালো কাজ করে",
      "শুধু টেক্সট প্রসেসিংয়ে কাজ করে"
    ],
    correctAnswer: 1,
    explanation: "লোকাল GPU ব্যবহারে API বিল থেকে মুক্তি পাওয়া যায় এবং ক্লাউড API এর চেয়ে স্পিড বেশি হতে পারে।"
  },

  {
    id: 17,
    question: "Ollama দিয়ে কোনো মডেল ডিলিট করতে কোন কমান্ড ব্যবহার করা হয়?",
    options: [
      "ollama delete [model]",
      "ollama rm [model]",
      "ollama remove [model]",
      "ollama uninstall [model]"
    ],
    correctAnswer: 1,
    explanation: "\"ollama rm [model]\" কমান্ড ব্যবহার করে নির্দিষ্ট কোনো মডেল Ollama থেকে মুছে ফেলা যায়।"
  },

  {
    id: 18,
    question: "Ollama দিয়ে নতুন মডেল ডাউনলোড করতে কোন কমান্ড ব্যবহার করা হয়?",
    options: [
      "ollama download [model]",
      "ollama fetch [model]",
      "ollama pull [model]",
      "ollama get [model]"
    ],
    correctAnswer: 2,
    explanation: "\"ollama pull [model]\" কমান্ড ব্যবহার করে নির্দিষ্ট মডেল ডাউনলোড করা যায়, যেমন: ollama pull mistral।"
  },

  {
    id: 19,
    question: "LM Studio তে Temperature সেটিংস কী নিয়ন্ত্রণ করে?",
    options: [
      "মডেলের সাইজ",
      "প্রতিক্রিয়ার র্যান্ডমনেস বা সৃজনশীলতা",
      "GPU মেমোরি ব্যবহার",
      "নেটওয়ার্ক স্পিড"
    ],
    correctAnswer: 1,
    explanation: "Temperature সেটিংস মডেলের রেসপন্সের র্যান্ডমনেস নিয়ন্ত্রণ করে। উচ্চ মানে বেশি সৃজনশীল এবং কম মানে বেশি নির্দিষ্ট উত্তর।"
  },

  {
    id: 20,
    question: "LM Studio তে Context Length কী নিয়ন্ত্রণ করে?",
    options: [
      "মডেল কতগুলো টোকেন একসাথে প্রসেস করবে",
      "GPU তে কতটুকু লোড হবে",
      "টেম্পারেচারের পরিমাপ",
      "ডাউনলোড স্পিড"
    ],
    correctAnswer: 0,
    explanation: "Context Length নির্ধারণ করে মডেল একসাথে কতগুলো টোকেন (শব্দের অংশ) প্রসেস করতে পারবে। বেশি Context Length মানে বড় টেক্সট বুঝতে পারবে।"
  },

  {
    id: 21,
    question: "লোকাল LLM চালাতে NVIDIA GPU কেন পছন্দনীয়?",
    options: [
      "NVIDIA সবসময় সস্তা",
      "NVIDIA GPU তে CUDA সাপোর্ট থাকে যা AI কাজে দ্রুত",
      "শুধু NVIDIA GPU তেই LLM চলে",
      "NVIDIA GPU ছাড়া কম্পিউটার চলে না"
    ],
    correctAnswer: 1,
    explanation: "NVIDIA GPU তে CUDA কোর থাকে যা AI এবং মেশিন লার্নিং কাজে অনেক দ্রুত পারফরম্যান্স দেয়।"
  },

  {
    id: 22,
    question: "Ollama এবং LM Studio এর মধ্যে একটি প্রধান পার্থক্য কী?",
    options: [
      "Ollama ফ্রি, LM Studio পেইড",
      "Ollama কমান্ড-লাইন ভিত্তিক, LM Studio GUI ভিত্তিক",
      "LM Studio শুধু Windows এ চলে",
      "Ollama শুধু Linux এ চলে"
    ],
    correctAnswer: 1,
    explanation: "Ollama একটি কমান্ড-লাইন টুল যেখানে LM Studio একটি গ্রাফিকাল ইন্টারফেস সহ ডেস্কটপ অ্যাপ।"
  },

  {
    id: 23,
    question: "CPU-only এ লোকাল LLM চালানোর ক্ষেত্রে কোনটি সত্য?",
    options: [
      "CPU তে কোনো LLM চালানো সম্ভব নয়",
      "CPU তে চলানো সম্ভব কিন্তু GPU এর চেয়ে ধীর",
      "CPU তে চালালে বেশি নির্ভুল ফলাফল পাওয়া যায়",
      "CPU তে শুধু ছোট মডেল চালানো যায় না"
    ],
    correctAnswer: 1,
    explanation: "CPU-only তে LLM চালানো সম্ভব কিন্তু GPU এর তুলনায় অনেক ধীর কাজ করে।"
  },

  {
    id: 24,
    question: "Ollama এর মডেলের বিস্তারিত তথ্য দেখতে কোন কমান্ড ব্যবহার করা হয়?",
    options: [
      "ollama info [model]",
      "ollama details [model]",
      "ollama show [model]",
      "ollama describe [model]"
    ],
    correctAnswer: 2,
    explanation: "\"ollama show [model]\" কমান্ড ব্যবহার করে কোনো মডেলের বিস্তারিত তথ্য যেমন প্যারামিটার সাইজ, ফ্যামিলি ইত্যাদি দেখা যায়।"
  },

  {
    id: 25,
    question: "লোকাল LLM কে পাইথন বা জাভাস্ক্রিপ্ট দিয়ে ইন্টিগ্রেট করতে কোন টুল ব্যবহার করা যায়?",
    options: [
      "LangChain",
      "Docker",
      "WordPress",
      "Photoshop"
    ],
    correctAnswer: 0,
    explanation: "LangChain ব্যবহার করে পাইথন বা জাভাস্ক্রিপ্ট এর মাধ্যমে লোকাল LLM (Ollama/LM Studio) কে অ্যাপ্লিকেশনে ইন্টিগ্রেট করা যায়।"
  },

  // ===================================================================
  // SESSION 7: Offline Agent Building (Q26-Q50)
  // ===================================================================

  {
    id: 26,
    question: "AI Agent কী?",
    options: [
      "শুধু প্রশ্নের উত্তর দেয় এমন চ্যাটবট",
      "যে সিস্টেম স্বাধীনভাবে পরিস্থিতি বুঝে, সিদ্ধান্ত নিয়ে কাজ করে",
      "একটি সাধারণ সার্চ ইঞ্জিন",
      "একটি স্প্রেডশিট সফটওয়্যার"
    ],
    correctAnswer: 1,
    explanation: "AI Agent হলো এমন একটি সিস্টেম যা নিজে থেকে পরিবেশ বুঝতে পারে, সিদ্ধান্ত নিতে পারে এবং স্বাধীনভাবে কাজ করতে পারে।"
  },

  {
    id: 27,
    question: "চ্যাটবট এবং AI Agent এর মধ্যে প্রধান পার্থক্য কী?",
    options: [
      "চ্যাটবট বেশি সুন্দর",
      "AI Agent স্বাধীনভাবে কাজ করতে পারে, চ্যাটবট শুধু উত্তর দেয়",
      "চ্যাটবট বেশি বুদ্ধিমান",
      "AI Agent শুধু টেক্সট বুঝতে পারে"
    ],
    correctAnswer: 1,
    explanation: "চ্যাটবট শুধু প্রশ্নের উত্তর দেয়, কিন্তু AI Agent স্বাধীনভাবে সিদ্ধান্ত নিয়ে কাজ সম্পাদন করতে পারে।"
  },

  {
    id: 28,
    question: "AI Agent এর তিনটি মূল উপাদান কী কী?",
    options: [
      "Input, Output, Storage",
      "Perception, Decision, Action",
      "Read, Write, Execute",
      "Listen, Think, Speak"
    ],
    correctAnswer: 1,
    explanation: "AI Agent এর তিনটি মূল উপাদান হলো Perception (ইনপুট বোঝা), Decision (যুক্তি ও পরিকল্পনা), এবং Action (কাজ বাস্তবায়ন)।"
  },

  {
    id: 29,
    question: "AI Agent এ Perception উপাদানটি কী করে?",
    options: [
      "সিদ্ধান্ত নেয়",
      "ইনপুট বা পরিবেশ বুঝতে সাহায্য করে",
      "ফাইল ডিলিট করে",
      "ইন্টারনেট ব্রাউজ করে"
    ],
    correctAnswer: 1,
    explanation: "Perception উপাদানটি এজেন্টকে বাইরের ইনপুট ও পরিবেশ বুঝতে সাহায্য করে, যেমন টেক্সট, অডিও বা ফাইল পড়া।"
  },

  {
    id: 30,
    question: "AI Agent এ Decision উপাদানটি কী করে?",
    options: [
      "ডেটা সংগ্রহ করে",
      "যুক্তিবিদ্যা ও পরিকল্পনার মাধ্যমে সিদ্ধান্ত নেয়",
      "ফাইল তৈরি করে",
      "ইমেইল পাঠায়"
    ],
    correctAnswer: 1,
    explanation: "Decision উপাদানটি পাওয়া তথ্যের ভিত্তিতে যুক্তিবিদ্যা ও পরিকল্পনার মাধ্যমে পরবর্তী পদক্ষেপ নির্ধারণ করে।"
  },

  {
    id: 31,
    question: "অফলাইন AI Agent এর কোন সুবিধা নেই?",
    options: [
      "ডেটা প্রাইভেসি",
      "জিরো কস্ট",
      "সবসময় সর্বশেষ তথ্য থাকে",
      "অফলাইনে কাজ করা"
    ],
    correctAnswer: 2,
    explanation: "অফলাইন AI Agent এ নলেজ কাট-অফ থাকে ফলে সর্বশেষ তথ্য পাওয়া যায় না। এটি এর একটি সীমাবদ্ধতা।"
  },

  {
    id: 32,
    question: "অফলাইন AI Agent এর কোন সুবিধাটি খরচ সংক্রান্ত?",
    options: [
      "API কলের জন্য অর্থ প্রদান করতে হয়",
      "কোনো খরচ নেই (জিরো কস্ট)",
      "মাসিক সাবস্ক্রিপশন প্রয়োজন",
      "প্রতি কোয়েরিতে টাকা লাগে"
    ],
    correctAnswer: 1,
    explanation: "অফলাইন AI Agent লোকাল মডেল ব্যবহার করে তাই কোনো API বিল বা খরচ নেই।"
  },

  {
    id: 33,
    question: "অফলাইন AI Agent তৈরির প্রথম ধাপ কী?",
    options: [
      "টুল ডিফাইন করা",
      "লোকাল LLM সেটআপ করা",
      "এজেন্ট পার্সোনা তৈরি করা",
      "টেস্টিং করা"
    ],
    correctAnswer: 1,
    explanation: "অফলাইন AI Agent তৈরির প্রথম ধাপ হলো লোকাল LLM সেটআপ করা, যেমন Ollama বা LM Studio দিয়ে।"
  },

  {
    id: 34,
    question: "AI Agent তৈরির জন্য কোন ফ্রেমওয়ার্কগুলো ব্যবহার করা যায়?",
    options: [
      "React এবং Angular",
      "LangChain, CrewAI, Vercel AI SDK",
      "Django এবং Flask",
      "Bootstrap এবं Tailwind"
    ],
    correctAnswer: 1,
    explanation: "AI Agent তৈরির জন্য LangChain, CrewAI, এবং Vercel AI SDK এর মতো ফ্রেমওয়ার্ক ব্যবহৃত হয়।"
  },

  {
    id: 35,
    question: "অফলাইন AI Agent এর সীমাবদ্ধতা কোনটি?",
    options: [
      "সবসময় ইন্টারনেট প্রয়োজন",
      "লোকাল মডেলের ক্ষমতা ক্লাউড মডেলের চেয়ে কম হতে পারে",
      "শুধু ইংরেজিতে কাজ করে",
      "কোনো টুল ব্যবহার করা যায় না"
    ],
    correctAnswer: 1,
    explanation: "লোকাল মডেলের ক্ষমতা সাধারণত ক্লাউড-ভিত্তিক বড় মডেলগুলোর চেয়ে কম হয়, এটি অফলাইন এজেন্টের একটি প্রধান সীমাবদ্ধতা।"
  },

  {
    id: 36,
    question: "কোড রিভিউ এজেন্ট কোন কাজগুলো করতে পারে?",
    options: [
      "শুধু কোড লেখে",
      "ফাইল পড়ে, কোড বিশ্লেষণ করে, সমাধান প্রস্তাব করে এবং রিপোর্ট লেখে",
      "শুধু ইমেইল পাঠায়",
      "শুধু ডেটাবেস ম্যানেজ করে"
    ],
    correctAnswer: 1,
    explanation: "কোড রিভিউ এজেন্ট ফাইল পড়তে পারে, কোড বিশ্লেষণ করতে পারে, উন্নতির প্রস্তাব দিতে পারে এবং রিপোর্ট তৈরি করতে পারে।"
  },

  {
    id: 37,
    question: "অফলাইন AI Agent এ নলেজ কাট-অফ বলতে কী বোঝায়?",
    options: [
      "এজেন্ট নতুন কিছু শিখতে পারে না",
      "মডেলের প্রশিক্ষণ ডেটা একটি নির্দিষ্ট সময় পর্যন্ত, এরপরের তথ্য জানে না",
      "ইন্টারনেট কানেকশন কেটে যায়",
      "মডেল অটোমেটিকালি আপডেট হয়"
    ],
    correctAnswer: 1,
    explanation: "নলেজ কাট-অফ মানে মডেলটি যে ডেটা দিয়ে প্রশিক্ষিত, সেই সময় পর্যন্তই তথ্য জানে। তারপরের ঘটনা বা তথ্য সম্পর্কে অজ্ঞাত থাকে।"
  },

  {
    id: 38,
    question: "মাল্টি-এজেন্ট সিস্টেমে এজেন্টরা কীভাবে কাজ করে?",
    options: [
      "প্রত্যেক এজেন্ট আলাদাভাবে কাজ করে",
      "এজেন্টদের নির্দিষ্ট ভূমিকা থাকে এবং একসাথে দলের মতো কাজ করে",
      "শুধু একটি এজেন্ট সব কাজ করে",
      "এজেন্টরা একে অপরের সাথে প্রতিযোগিতা করে"
    ],
    correctAnswer: 1,
    explanation: "মাল্টি-এজেন্ট সিস্টেমে প্রতিটি এজেন্টের নির্দিষ্ট ভূমিকা থাকে এবং তারা একটি দলের মতো সহযোগিতামূলকভাবে কাজ করে।"
  },

  {
    id: 39,
    question: "কোন টুলগুলো মাল্টি-এজেন্ট সিস্টেম তৈরির জন্য ব্যবহৃত হয়?",
    options: [
      "React এবং Vue.js",
      "CrewAI, AutoGen, LangGraph",
      "Docker এবং Kubernetes",
      "Firebase এবং Supabase"
    ],
    correctAnswer: 1,
    explanation: "CrewAI, AutoGen, এবং LangGraph হলো মাল্টি-এজেন্ট সিস্টেম তৈরির জন্য বিশেষভাবে ডিজাইন করা ফ্রেমওয়ার্ক।"
  },

  {
    id: 40,
    question: "মাল্টি-এজেন্ট সিস্টেমে Programmer Agent এর কাজ কী?",
    options: [
      "কোড টেস্ট করা",
      "কোড লেখা",
      "কোড ডিলিট করা",
      "কোড ডিপ্লয় করা"
    ],
    correctAnswer: 1,
    explanation: "মাল্টি-এজেন্ট সিস্টেমে Programmer Agent এর দায়িত্ব কোড লেখা, Reviewer Agent কোড রিভিউ করে এবং QA Agent টেস্ট করে।"
  },

  {
    id: 41,
    question: "অফলাইন AI Agent এ কনটেক্সট উইন্ডো লিমিট কী?",
    options: [
      "এজেন্ট যত খুশি বড় টেক্সট প্রসেস করতে পারে",
      "একসাথে একটি নির্দিষ্ট পরিমাণ টেক্সটই প্রসেস করা সম্ভব",
      "শুধু এক লাইন টেক্সট প্রসেস করা যায়",
      "কোনো লিমিট নেই"
    ],
    correctAnswer: 1,
    explanation: "কনটেক্সট উইন্ডো লিমিট মানে এজেন্ট একসাথে একটি নির্দিষ্ট সংখ্যক টোকেন পর্যন্ত প্রসেস করতে পারে, এর বেশি হলে তথ্য বাদ পড়তে পারে।"
  },

  {
    id: 42,
    question: "অফলাইন AI Agent তৈরির ধাপগুলোর মধ্যে টুল ডিফাইন করা হলো কত নম্বর ধাপ?",
    options: [
      "প্রথম",
      "দ্বিতীয়",
      "তৃতীয়",
      "চতুর্থ"
    ],
    correctAnswer: 2,
    explanation: "অফলাইন AI Agent তৈরির ধাপ: ১) লোকাল LLM সেটআপ, ২) এজেন্ট ফ্রেমওয়ার্ক নির্বাচন, ৩) টুল ডিফাইন করা, ৪) এজেন্ট পার্সোনা ডিজাইন, ৫) টেস্টিং।"
  },

  {
    id: 43,
    question: "অফলাইন AI Agent এর কোন সুবিধাটি ডেটা লিমিট সংক্রান্ত?",
    options: [
      "প্রতিদিন ডেটা লিমিট থাকে",
      "কোনো ডেটা লিমিট নেই",
      "সপ্তাহে একবার ব্যবহার করা যায়",
      "শুধু ১০০ কোয়েরি দেওয়া যায়"
    ],
    correctAnswer: 1,
    explanation: "অফলাইন AI Agent এ কোনো ডেটা বা ব্যবহারের লিমিট নেই কারণ এটি লোকাল মডেল ব্যবহার করে।"
  },

  {
    id: 44,
    question: "ডকুমেন্ট এজেন্ট কোন ধরনের কাজ করতে পারে?",
    options: [
      "শুধু ছবি এডিট করা",
      "ডকুমেন্ট বিশ্লেষণ, সারাংশ তৈরি এবং তথ্য বের করা",
      "শুধু ইমেইল পাঠানো",
      "শুধু ওয়েবসাইট ডিজাইন করা"
    ],
    correctAnswer: 1,
    explanation: "ডকুমেন্ট এজেন্ট ডকুমেন্ট পড়তে, বিশ্লেষণ করতে, সারাংশ তৈরি করতে এবং গুরুত্বপূর্ণ তথ্য বের করতে সক্ষম।"
  },

  {
    id: 45,
    question: "অফলাইন AI Agent এ হার্ডওয়্যার রিকয়ারমেন্ট কোনটি?",
    options: [
      "শুধু ইন্টারনেট কানেকশন প্রয়োজন",
      "GPU (বিশেষ করে NVIDIA) প্রয়োজন ভালো পারফরম্যান্সের জন্য",
      "কোনো বিশেষ হার্ডওয়্যার লাগে না",
      "শুধু হার্ড ডিস্ক প্রয়োজন"
    ],
    correctAnswer: 1,
    explanation: "অফলাইন AI Agent ভালো পারফরম্যান্সের জন্য GPU (বিশেষ করে NVIDIA) প্রয়োজন, CPU-only তে ধীরগতির কাজ করে।"
  },

  {
    id: 46,
    question: "LangGraph কী ধরনের ফ্রেমওয়ার্ক?",
    options: [
      "ওয়েব ডেভেলপমেন্ট ফ্রেমওয়ার্ক",
      "মাল্টি-এজেন্ট ও ওয়ার্কফ্লো ম্যানেজমেন্ট ফ্রেমওয়ার্ক",
      "ডাটাবেস ম্যানেজমেন্ট ফ্রেমওয়ার্ক",
      "মোবাইল অ্যাপ ডেভেলপমেন্ট ফ্রেমওয়ার্ক"
    ],
    correctAnswer: 1,
    explanation: "LangGraph একটি মাল্টি-এজেন্ট এবং ওয়ার্কফ্লো ম্যানেজমেন্ট ফ্রেমওয়ার্ক যা LangChain এর পরিবারভুক্ত।"
  },

  {
    id: 47,
    question: "অফলাইন AI Agent এ ফুল কাস্টোমাইজেশন বলতে কী বোঝায়?",
    options: [
      "শুধু থিম পরিবর্তন করা",
      "মডেল, টুল এবং এজেন্টের আচরণ সম্পূর্ণভাবে নিজের মতো কনফিগার করা",
      "শুধু ভাষা পরিবর্তন করা",
      "শুধু ফন্ট সাইজ পরিবর্তন করা"
    ],
    correctAnswer: 1,
    explanation: "ফুল কাস্টোমাইজেশন মানে মডেল সিলেকশন, টুল ডিফিনেশন, এজেন্ট পার্সোনা সবকিছু নিজের প্রয়োজন অনুযায়ী কনফিগার করা।"
  },

  {
    id: 48,
    question: "অফলাইন AI Agent এ Agent Persona Design কেন গুরুত্বপূর্ণ?",
    options: [
      "এজেন্টকে সুন্দর দেখানোর জন্য",
      "এজেন্টের আচরণ, ভাষা ও দায়িত্ব নির্ধারণ করার জন্য",
      "এজেন্টকে দ্রুত কাজ করানোর জন্য",
      "এজেন্টকে ইন্টারনেটে কানেক্ট করার জন্য"
    ],
    correctAnswer: 1,
    explanation: "Agent Persona Design দিয়ে এজেন্টের কীভাবে কথা বলবে, কী কী কাজ করবে এবং কীভাবে সিদ্ধান্ত নেবে তা নির্ধারণ করা হয়।"
  },

  {
    id: 49,
    question: "মাল্টি-এজেন্ট সিস্টেমে QA Agent এর ভূমিকা কী?",
    options: [
      "কোড লেখা",
      "কোড রিভিউ করা",
      "কোড টেস্টিং করা",
      "কোড ডিপ্লয় করা"
    ],
    correctAnswer: 2,
    explanation: "মাল্টি-এজেন্ট সিস্টেমে QA (Quality Assurance) Agent এর দায়িত্ব কোড টেস্টিং করা এবং বাগ খুঁজে বের করা।"
  },

  {
    id: 50,
    question: "অফলাইন AI Agent তৈরির শেষ ধাপ কী?",
    options: [
      "মডেল ডাউনলোড করা",
      "ফ্রেমওয়ার্ক ইনস্টল করা",
      "টেস্টিং করা",
      "টুল ডিফাইন করা"
    ],
    correctAnswer: 2,
    explanation: "অফলাইন AI Agent তৈরির পাঁচটি ধাপের মধ্যে শেষ ধাপ হলো টেস্টিং, যেখানে এজেন্টের কার্যকারিতা যাচাই করা হয়।"
  }
];
