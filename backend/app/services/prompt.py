"""
Prompt engineering for the AccessAI assistant.

Defines the system prompt, category templates, and helpers that shape
how OpenAI responds to student career and education questions.
"""

from typing import Dict, List, Optional

# Core system prompt — instructs the model to return structured markdown
SYSTEM_PROMPT = """You are AccessAI, an expert career and education advisor for students,
fresh graduates, and job seekers worldwide. Your mission is to improve access to
education, scholarships, internships, careers, learning resources, and AI guidance.

When answering any question, you MUST structure your response using exactly these
markdown sections in this order:

## Summary
A concise 2-4 sentence overview of the answer.

## Recommendations
A bulleted list of 4-8 specific, actionable recommendations tailored to the user's
background, location, and goals when provided.

## Useful Links
A bulleted list of real, reputable resources. Format each as:
- [Title](https://url) — brief description

Prefer official university sites, government portals, well-known platforms
(LinkedIn, Coursera, DAAD, Chevening, etc.), and established organizations.

## Action Plan
A numbered list of 3-6 concrete next steps the user can take immediately or this week.

Guidelines:
- Be encouraging, practical, and inclusive — users may be from any country or background.
- Ask clarifying questions only when critical information is missing; otherwise make reasonable assumptions and state them.
- Use clear, accessible language suitable for high school and university students.
- Include country-specific advice when the user mentions a location.
- Never invent fake scholarships, jobs, or URLs. If unsure, suggest search strategies and known platforms.
- Keep responses focused and scannable."""

# Prompt templates keyed by category — used when user selects a suggested prompt
PROMPT_TEMPLATES: Dict[str, Dict[str, str]] = {
    "scholarships": {
        "label": "Scholarships",
        "description": "Find scholarships by country, field, or degree level",
        "prompt": (
            "Help me find scholarships that match my profile. "
            "Ask about my field of study, degree level, nationality, and target countries "
            "if not clear from my message. List fully funded and partial options with "
            "eligibility requirements and application deadlines where known."
        ),
        "icon": "graduation-cap",
    },
    "internships": {
        "label": "Internships",
        "description": "Discover internships in tech, business, and more",
        "prompt": (
            "Suggest internships suitable for my background. Include remote and on-site "
            "options, required skills, how to apply, and tips to stand out. "
            "Cover both corporate and startup opportunities."
        ),
        "icon": "briefcase",
    },
    "career_advice": {
        "label": "Career Advice",
        "description": "Get personalized career path guidance",
        "prompt": (
            "Provide career advice based on my interests and skills. "
            "Suggest career paths, growth trajectories, salary expectations where relevant, "
            "and how to transition between fields if applicable."
        ),
        "icon": "compass",
    },
    "learning_roadmap": {
        "label": "Learning Roadmap",
        "description": "Build a step-by-step skill development plan",
        "prompt": (
            "Create a structured learning roadmap for the skills or field I want to pursue. "
            "Include beginner to advanced phases, recommended courses, projects to build, "
            "and estimated timelines for each stage."
        ),
        "icon": "map",
    },
    "resume_tips": {
        "label": "Resume Tips",
        "description": "Improve your CV and stand out to recruiters",
        "prompt": (
            "Give me actionable resume and CV tips for my target role and experience level. "
            "Include section structure, keywords for ATS, quantifying achievements, "
            "and common mistakes to avoid."
        ),
        "icon": "file-text",
    },
    "interview_questions": {
        "label": "Interview Questions",
        "description": "Prepare for technical and behavioral interviews",
        "prompt": (
            "Help me prepare for job interviews in my field. Provide common technical "
            "and behavioral questions, sample answer frameworks using STAR method, "
            "and tips for virtual and in-person interviews."
        ),
        "icon": "message-circle",
    },
    "freelancing": {
        "label": "Freelancing",
        "description": "Start earning with freelance skills",
        "prompt": (
            "Guide me on starting freelancing with my skills. Cover platforms to join, "
            "how to price services, building a portfolio, getting first clients, "
            "and managing taxes and contracts basics."
        ),
        "icon": "dollar-sign",
    },
    "hackathons": {
        "label": "Hackathons",
        "description": "Find hackathons and competitions to join",
        "prompt": (
            "Recommend hackathons, coding competitions, and innovation challenges I can join. "
            "Include online and in-person events, prize types, team formation tips, "
            "and how to prepare for a winning project."
        ),
        "icon": "trophy",
    },
}

# Suggested starter prompts shown on the dashboard before the user types
SUGGESTED_PROMPTS: List[str] = [
    "I want scholarships in Germany for a Master's in Computer Science",
    "I am a CS student in Pakistan — what opportunities should I explore?",
    "Suggest an AI and machine learning roadmap for beginners",
    "What skills should I learn to become a full-stack developer?",
    "How do I prepare for a Google software engineering interview?",
    "What are the best remote internship platforms for students?",
    "Help me write a strong resume for my first tech job",
    "Which hackathons are open for students right now?",
]


def get_system_prompt() -> str:
    """Return the base system prompt sent with every chat completion."""
    return SYSTEM_PROMPT


def get_template_keys() -> List[str]:
    """Return all available prompt template keys."""
    return list(PROMPT_TEMPLATES.keys())


def get_template(template_key: str) -> Optional[Dict[str, str]]:
    """
    Look up a prompt template by key.

    Args:
        template_key: Normalized key such as 'scholarships' or 'career_advice'.

    Returns:
        Template dict with label, description, prompt, and icon — or None if unknown.
    """
    return PROMPT_TEMPLATES.get(template_key)


def get_all_templates() -> List[Dict[str, str]]:
    """
    Return all templates as a list for the frontend suggested-prompts UI.

    Each item includes the key plus label, description, prompt, and icon.
    """
    return [
        {"key": key, **value}
        for key, value in PROMPT_TEMPLATES.items()
    ]


def build_user_message(user_message: str, template_key: Optional[str] = None) -> str:
    """
    Combine the user's message with an optional template prefix.

    If a template is selected, its prompt is prepended as context so the model
    focuses on the right category while still honoring the user's specific question.

    Args:
        user_message: Raw text from the chat input.
        template_key: Optional category key from PROMPT_TEMPLATES.

    Returns:
        Final user message string sent to OpenAI.
    """
    message = user_message.strip()
    if not template_key:
        return message

    template = get_template(template_key)
    if not template:
        return message

    # If the user message is very short or matches the template prompt, use template only
    if len(message) < 20:
        return template["prompt"]

    return (
        f"[Context: {template['label']}]\n"
        f"{template['prompt']}\n\n"
        f"User's specific question: {message}"
    )


def get_suggested_prompts() -> List[str]:
    """Return starter prompts for the dashboard UI."""
    return SUGGESTED_PROMPTS.copy()
