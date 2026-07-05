/**
 * Shared prompt templates and suggested prompts for the AccessAI frontend.
 *
 * Keys and labels mirror backend/app/services/prompt.py so the UI
 * and API stay in sync when users select a category.
 */

/** Prompt template categories sent as `template` in POST /chat */
export const PROMPT_TEMPLATES = {
  scholarships: {
    key: "scholarships",
    label: "Scholarships",
    description: "Find scholarships by country, field, or degree level",
    prompt:
      "Help me find scholarships that match my profile. Ask about my field of study, degree level, nationality, and target countries if not clear from my message.",
    icon: "graduation-cap",
  },
  internships: {
    key: "internships",
    label: "Internships",
    description: "Discover internships in tech, business, and more",
    prompt:
      "Suggest internships suitable for my background. Include remote and on-site options, required skills, and how to apply.",
    icon: "briefcase",
  },
  career_advice: {
    key: "career_advice",
    label: "Career Advice",
    description: "Get personalized career path guidance",
    prompt:
      "Provide career advice based on my interests and skills. Suggest career paths and growth trajectories.",
    icon: "compass",
  },
  learning_roadmap: {
    key: "learning_roadmap",
    label: "Learning Roadmap",
    description: "Build a step-by-step skill development plan",
    prompt:
      "Create a structured learning roadmap for the skills or field I want to pursue, from beginner to advanced.",
    icon: "map",
  },
  resume_tips: {
    key: "resume_tips",
    label: "Resume Tips",
    description: "Improve your CV and stand out to recruiters",
    prompt:
      "Give me actionable resume and CV tips for my target role and experience level.",
    icon: "file-text",
  },
  interview_questions: {
    key: "interview_questions",
    label: "Interview Prep",
    description: "Prepare for technical and behavioral interviews",
    prompt:
      "Help me prepare for job interviews in my field with common questions and STAR method frameworks.",
    icon: "message-circle",
  },
  freelancing: {
    key: "freelancing",
    label: "Freelancing",
    description: "Start earning with freelance skills",
    prompt:
      "Guide me on starting freelancing with my skills — platforms, pricing, and first clients.",
    icon: "dollar-sign",
  },
  hackathons: {
    key: "hackathons",
    label: "Hackathons",
    description: "Find hackathons and competitions to join",
    prompt:
      "Recommend hackathons, coding competitions, and innovation challenges I can join.",
    icon: "trophy",
  },
};

/** Clickable starter prompts on the dashboard welcome screen */
export const SUGGESTED_PROMPTS = [
  "I want scholarships in Germany for a Master's in Computer Science",
  "I am a CS student in Pakistan — what opportunities should I explore?",
  "Suggest an AI and machine learning roadmap for beginners",
  "What skills should I learn to become a full-stack developer?",
  "How do I prepare for a Google software engineering interview?",
  "What are the best remote internship platforms for students?",
  "Help me write a strong resume for my first tech job",
  "Which hackathons are open for students right now?",
];

/**
 * Return all templates as an array for UI rendering.
 * @returns {Array<{ key: string, label: string, description: string, prompt: string, icon: string }>}
 */
export function getAllTemplates() {
  return Object.values(PROMPT_TEMPLATES);
}

/**
 * Look up a template by key.
 * @param {string|null} key
 * @returns {object|null}
 */
export function getTemplateByKey(key) {
  if (!key) return null;
  return PROMPT_TEMPLATES[key] || null;
}

/**
 * Return a copy of suggested prompts.
 * @returns {string[]}
 */
export function getSuggestedPrompts() {
  return [...SUGGESTED_PROMPTS];
}
