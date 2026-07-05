/**
 * Landing page — Cursor-inspired monochrome homepage.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
  Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const STATS = [
  { value: "10K+", label: "Students Helped", icon: Users },
  { value: "50+", label: "Countries Covered", icon: Globe },
  { value: "8", label: "AI Categories", icon: Zap },
  { value: "24/7", label: "Instant Guidance", icon: Sparkles },
];

const FEATURES = [
  { icon: GraduationCap, title: "Scholarships", description: "Find fully funded and partial scholarships tailored to your profile and target countries." },
  { icon: Briefcase, title: "Internships", description: "Discover remote and on-site internships in tech, business, and emerging fields." },
  { icon: Compass, title: "Career Advice", description: "Get personalized career path guidance based on your skills and interests." },
  { icon: Map, title: "Learning Roadmaps", description: "Build step-by-step skill development plans from beginner to advanced." },
  { icon: FileText, title: "Resume Tips", description: "Craft ATS-friendly resumes that stand out to recruiters worldwide." },
  { icon: MessageCircle, title: "Interview Prep", description: "Prepare for technical and behavioral interviews with AI-guided practice." },
  { icon: DollarSign, title: "Freelancing", description: "Start earning with freelance skills — platforms, pricing, and first clients." },
  { icon: Trophy, title: "Hackathons", description: "Find coding competitions and innovation challenges to boost your portfolio." },
];

function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border-dark bg-black/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-sm font-semibold tracking-tight text-ink-inverse uppercase">
            AccessAI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-neutral-400 hover:text-ink-inverse transition-colors">Features</a>
            <a href="#stats" className="text-sm text-neutral-400 hover:text-ink-inverse transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex btn-secondary text-sm py-2 px-4">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-36 pb-24 px-6 border-b border-surface-border-dark">
      <div className="max-w-4xl mx-auto">
        <motion.p initial="hidden" animate="visible" custom={0} variants={fadeUp} className="section-label mb-6">
          Ctrl+V Hackathon — Improve Access
        </motion.p>
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-inverse text-balance mb-6"
        >
          Your AI guide to education and careers
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-lg text-neutral-400 max-w-2xl mb-10 leading-relaxed"
        >
          Discover scholarships, internships, learning roadmaps, and career opportunities
          instantly — for students worldwide.
        </motion.p>
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-3">
          <Link to="/signup" className="btn-primary px-6 py-3">
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/dashboard" className="btn-secondary px-6 py-3">Try Demo</Link>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="stats" className="accent-strip py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="surface-card p-8 text-center"
          >
            <stat.icon className="w-5 h-5 mx-auto mb-4 text-white" strokeWidth={1.5} />
            <p className="text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-2 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <p className="section-label mb-4">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-inverse mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-neutral-400 leading-relaxed">
            AccessAI improves access to education, scholarships, internships, careers,
            learning, and AI guidance — all in one place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="surface-card p-6"
            >
              <feature.icon className="w-5 h-5 mb-4 text-white" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="accent-strip py-24 px-6">
      <div className="max-w-3xl mx-auto text-center surface-card p-12">
        <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
          Ready to unlock your future?
        </h2>
        <p className="text-neutral-400 mb-8">
          Join students using AI to find opportunities worldwide.
        </p>
        <Link to="/signup" className="btn-primary px-8 py-3 inline-flex">
          Create Free Account <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-surface-border-dark py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
        <span className="font-medium text-ink-inverse uppercase tracking-tight text-xs">AccessAI</span>
        <div className="flex gap-6">
          <Link to="/dashboard" className="hover:text-ink-inverse transition-colors">Dashboard</Link>
          <Link to="/login" className="hover:text-ink-inverse transition-colors">Log In</Link>
          <Link to="/signup" className="hover:text-ink-inverse transition-colors">Sign Up</Link>
        </div>
        <p>© {new Date().getFullYear()} AccessAI</p>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-canvas-dark">
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
