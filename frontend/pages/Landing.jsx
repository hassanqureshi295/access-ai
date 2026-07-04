/**
 * Landing page — public homepage for AccessAI.
 *
 * Sections: navbar, hero, statistics, feature cards, CTA, footer.
 * Matches PROJECT_SPEC homepage requirements.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Compass,
  Map,
  FileText,
  MessageCircle,
  DollarSign,
  Trophy,
  Users,
  Globe,
  Zap,
} from "lucide-react";

/** Animation variants for staggered entrance */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/** Homepage statistics */
const STATS = [
  { value: "10K+", label: "Students Helped", icon: Users },
  { value: "50+", label: "Countries Covered", icon: Globe },
  { value: "8", label: "AI Categories", icon: Zap },
  { value: "24/7", label: "Instant Guidance", icon: Sparkles },
];

/** Feature cards aligned with prompt templates */
const FEATURES = [
  {
    icon: GraduationCap,
    title: "Scholarships",
    description: "Discover fully funded and partial scholarships tailored to your profile and target countries.",
  },
  {
    icon: Briefcase,
    title: "Internships",
    description: "Find remote and on-site internships in tech, business, and emerging fields.",
  },
  {
    icon: Compass,
    title: "Career Advice",
    description: "Get personalized career path guidance based on your skills and interests.",
  },
  {
    icon: Map,
    title: "Learning Roadmaps",
    description: "Build step-by-step skill development plans from beginner to advanced.",
  },
  {
    icon: FileText,
    title: "Resume Tips",
    description: "Craft ATS-friendly resumes that stand out to recruiters worldwide.",
  },
  {
    icon: MessageCircle,
    title: "Interview Prep",
    description: "Prepare for technical and behavioral interviews with AI-guided practice.",
  },
  {
    icon: DollarSign,
    title: "Freelancing",
    description: "Start earning with freelance skills — platforms, pricing, and first clients.",
  },
  {
    icon: Trophy,
    title: "Hackathons",
    description: "Find coding competitions and innovation challenges to boost your portfolio.",
  },
];

/**
 * Top navigation bar for the landing page.
 */
function LandingNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-slate-700/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">AccessAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Features
            </a>
            <a href="#stats" className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Impact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex btn-secondary py-2 px-4 text-sm">
              Log In
            </Link>
            <Link to="/signup" className="btn-primary py-2 px-4 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

/**
 * Hero section with headline, subtext, and call-to-action buttons.
 */
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-brand-soft dark:bg-gradient-dark" />
      <div className="absolute inset-0 bg-gradient-mesh" />

      <div className="relative max-w-7xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass text-sm font-medium text-brand-700 dark:text-brand-300"
        >
          <Sparkles className="w-4 h-4" />
          Ctrl+V Hackathon — Improve Access
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6"
        >
          Your AI Guide to{" "}
          <span className="text-gradient">Education & Careers</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10"
        >
          Discover scholarships, internships, learning roadmaps, and career opportunities
          instantly — powered by AI for students worldwide.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup" className="btn-primary text-lg px-8 py-4">
            Start Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/dashboard" className="btn-secondary text-lg px-8 py-4">
            Try Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Statistics section showing platform impact numbers.
 */
function StatsSection() {
  return (
    <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="feature-card text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-brand-600 dark:text-brand-400" />
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Feature cards grid showcasing AI assistant categories.
 */
function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-300">
            AccessAI improves access to education, scholarships, internships, careers,
            learning, and AI guidance — all in one place.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="feature-card group"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-brand-100 dark:bg-brand-900/40 group-hover:shadow-glow transition-shadow">
                <feature.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Call-to-action banner before the footer.
 */
function CtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="max-w-4xl mx-auto text-center rounded-4xl bg-gradient-brand p-10 sm:p-14 shadow-glow-lg"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Unlock Your Future?
        </h2>
        <p className="text-brand-100 mb-8 text-lg">
          Join thousands of students using AI to find opportunities worldwide.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-700 font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          Create Free Account
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </section>
  );
}

/**
 * Site footer with links and copyright.
 */
function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-700/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span className="font-bold text-slate-800 dark:text-white">AccessAI</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Log In
          </Link>
          <Link to="/signup" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Sign Up
          </Link>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} AccessAI. Improve Access.
        </p>
      </div>
    </footer>
  );
}

/**
 * AccessAI landing page — composes all homepage sections.
 */
function Landing() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}

export default Landing;
