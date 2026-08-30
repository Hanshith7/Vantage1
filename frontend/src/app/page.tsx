"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LandingNav from "@/components/landing/LandingNav";
import RedflagGreenlight from "@/components/landing/RedflagGreenlight";
import {
  HowItWorks,
  SystemsPreview,
  SeeWhatChanged,
  Explainability,
  FinalCTA,
} from "@/components/landing/LandingSections";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-16"
      >
        {/* Subtle radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--signal-red) 0%, transparent 70%)",
          }}
        />

        <motion.div
          className="relative z-10 text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.p
            className="text-xs font-medium tracking-[0.3em] text-text-muted uppercase mb-8"
            variants={fadeUp}
          >
            VANTAGE
          </motion.p>

          <motion.h1
            className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter"
            style={{ color: "var(--signal-red)" }}
            variants={fadeUp}
          >
            REDFLAG
          </motion.h1>

          <motion.p
            className="mt-8 text-text-secondary text-lg md:text-xl max-w-lg mx-auto leading-relaxed"
            variants={fadeUp}
          >
            See unusual patterns before they become bigger problems.
          </motion.p>

          <motion.p
            className="mt-3 text-text-muted text-sm max-w-md mx-auto"
            variants={fadeUp}
          >
            Vantage brings connected institutional activity into one clear view.
          </motion.p>

          <motion.div className="mt-10" variants={fadeUp}>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-surface-raised border border-border-subtle text-text-primary text-sm font-medium hover:bg-surface-hover hover:border-border-strong transition-all duration-200"
            >
              Explore Vantage
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="w-5 h-8 rounded-full border border-border-strong flex items-start justify-center pt-1.5">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-text-muted"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── REDFLAG → GREENLIGHT Scroll Transition ────────────── */}
      <RedflagGreenlight />

      {/* ── How it works ────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Systems preview ─────────────────────────────────────── */}
      <SystemsPreview />

      {/* ── See what changed ────────────────────────────────────── */}
      <SeeWhatChanged />

      {/* ── Explainability ──────────────────────────────────────── */}
      <Explainability />

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <FinalCTA />

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-bold tracking-tight text-text-muted">
            VANTAGE
          </span>
          <p className="text-xs text-text-muted">
            Institutional intelligence, made visible. Prototype v1.0
          </p>
        </div>
      </footer>
    </main>
  );
}
