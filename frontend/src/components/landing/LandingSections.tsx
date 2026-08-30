"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── Section: How Vantage Works ───────────────────────────────────── */

const STEPS = [
  {
    num: "01",
    title: "CONNECT",
    desc: "Connect authorized institutional systems through secure, validated integrations.",
  },
  {
    num: "02",
    title: "OBSERVE",
    desc: "Understand normal activity patterns over time across every connected system.",
  },
  {
    num: "03",
    title: "NOTICE",
    desc: "Identify meaningful deviations that fall outside established expected ranges.",
  },
  {
    num: "04",
    title: "CLARIFY",
    desc: "Bring related signals into context so humans can make informed decisions.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          How Vantage works
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i * 0.1}
              variants={fadeUp}
            >
              <span className="text-xs font-medium tracking-widest text-text-muted uppercase">
                {step.num}
              </span>
              <h3
                className="font-heading text-xl font-bold mt-2 mb-3 tracking-tight"
                style={{ color: "var(--accent-green)" }}
              >
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                {step.desc}
              </p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-8 top-8 text-text-muted/20">
                  <ArrowRight size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: Everything in View ──────────────────────────────────── */

const SYSTEMS_PREVIEW = [
  { name: "Attendance", status: "Connected", health: "Healthy", metric: "91.4%" },
  { name: "Student Portal", status: "Connected", health: "Healthy", metric: "342 sessions" },
  { name: "Faculty Services", status: "Connected", health: "Healthy", metric: "28 active" },
  { name: "Database Health", status: "Connected", health: "Healthy", metric: "24ms" },
];

export function SystemsPreview() {
  return (
    <section id="systems" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-center mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          Everything in view
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-16 max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0.1}
          variants={fadeUp}
        >
          Connected systems reporting their current state — one calm overview.
        </motion.p>

        <motion.div
          className="rounded-xl border border-border-subtle bg-surface overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          custom={0.2}
          variants={fadeUp}
        >
          <div className="grid grid-cols-4 gap-px text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3 bg-surface-raised border-b border-border-subtle">
            <span>System</span>
            <span>Status</span>
            <span>Health</span>
            <span className="text-right">Current</span>
          </div>
          {SYSTEMS_PREVIEW.map((sys) => (
            <div
              key={sys.name}
              className="grid grid-cols-4 gap-px px-6 py-4 border-b border-border-subtle last:border-b-0 hover:bg-surface-hover/50 transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">
                {sys.name}
              </span>
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {sys.status}
              </span>
              <span className="text-sm text-accent">{sys.health}</span>
              <span className="text-sm text-text-secondary text-right">
                {sys.metric}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section: See What Changed ────────────────────────────────────── */

export function SeeWhatChanged() {
  // Simulated activity data — mostly neutral, one deviation
  const bars = [
    88, 91, 90, 92, 89, 93, 91, 90, 92, 91, 90, 89, 91, 93, 92, 90, 62, 89, 91, 90,
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-center mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          See what changed
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-16 max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0.1}
          variants={fadeUp}
        >
          Most activity follows expected patterns. Only the meaningful deviation stands out.
        </motion.p>

        <motion.div
          className="flex items-end justify-center gap-1.5 h-48"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          custom={0.2}
          variants={fadeUp}
        >
          {bars.map((val, i) => (
            <motion.div
              key={i}
              className="w-4 md:w-5 rounded-sm"
              initial={{ height: 0 }}
              whileInView={{ height: `${(val / 100) * 180}px` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.03, ease: "easeOut" }}
              style={{
                backgroundColor:
                  i === 16 ? "var(--signal-red)" : "var(--surface-raised)",
              }}
            />
          ))}
        </motion.div>
        <p className="text-center text-xs text-text-muted mt-4">
          Attendance activity — 20 sessions
        </p>
      </div>
    </section>
  );
}

/* ── Section: Not Just an Alert (Explainability) ──────────────────── */

export function Explainability() {
  return (
    <section id="intelligence" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-center mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          Not just an alert
        </motion.h2>
        <motion.p
          className="text-text-secondary text-center mb-16 max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={0.1}
          variants={fadeUp}
        >
          Every signal comes with context — what changed, why it was noticed, and what happened around it.
        </motion.p>

        <motion.div
          className="rounded-xl border border-border-subtle bg-surface p-8 space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          custom={0.2}
          variants={fadeUp}
        >
          <div>
            <h4 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">
              What changed
            </h4>
            <p className="text-sm text-text-primary">
              Attendance dropped to 62%, below the expected range of 89–94%.
            </p>
          </div>
          <div className="border-t border-border-subtle" />
          <div>
            <h4 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">
              Why it was noticed
            </h4>
            <ul className="space-y-1.5">
              {[
                "Significant deviation from expected range",
                "Sudden change from previous session",
                "Other sections remain within normal range",
              ].map((r, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-signal-red" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-border-subtle" />
          <div>
            <h4 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">
              Related activity
            </h4>
            <p className="text-sm text-text-secondary">
              Database response time increased during the same period.
            </p>
          </div>
          <div className="border-t border-border-subtle" />
          <div>
            <h4 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">
              Current state
            </h4>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--signal-amber)" }}
            >
              <span className="w-2 h-2 rounded-full bg-signal-amber" />
              Under review
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Section: Final CTA ───────────────────────────────────────────── */

export function FinalCTA() {
  return (
    <section className="py-32 px-6 text-center">
      <motion.div
        className="max-w-2xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <h2
          className="font-heading text-5xl md:text-7xl font-extrabold tracking-tighter mb-6"
          style={{ color: "var(--accent-green)" }}
        >
          GREENLIGHT
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
          Clearer context. Earlier attention. Better decisions.
        </p>
        <a
          href="/app"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-canvas font-medium text-base hover:bg-accent-hover transition-colors duration-200"
        >
          Open Vantage
          <ArrowRight size={18} />
        </a>
      </motion.div>
    </section>
  );
}
