"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The signature REDFLAG → GREENLIGHT scroll-driven transition.
 *
 * Pinned for ~4 viewport heights of scroll. Stages:
 * 1. REDFLAG in red
 * 2. "Something changed" — context appears
 * 3. "Context changes everything" — signal + related + expected = clarity
 * 4. Color morph → GREENLIGHT in mint
 */
export default function RedflagGreenlight() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        // Stage 1: REDFLAG visible (already in DOM)
        tl.to(".rf-redflag", { opacity: 1, duration: 0.1 });

        // Stage 1→2: Fade out REDFLAG, fade in "Something changed"
        tl.to(".rf-redflag", { opacity: 0, y: -30, duration: 1 }, "+=0.5");
        tl.fromTo(
          ".rf-stage2",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.5"
        );

        // Hold stage 2
        tl.to({}, { duration: 0.5 });

        // Stage 2→3: Fade out stage 2, fade in context
        tl.to(".rf-stage2", { opacity: 0, y: -30, duration: 1 });
        tl.fromTo(
          ".rf-stage3",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.5"
        );

        // Stagger the equation elements
        tl.fromTo(
          ".rf-equation > div",
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, stagger: 0.15, duration: 0.5 },
          "-=0.3"
        );

        // Hold stage 3
        tl.to({}, { duration: 0.5 });

        // Stage 3→4: Transition to GREENLIGHT
        tl.to(".rf-stage3", { opacity: 0, y: -30, duration: 1 });

        // Color shift and GREENLIGHT reveal
        tl.fromTo(
          ".rf-greenlight",
          { opacity: 0, scale: 0.95, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power2.out" },
          "-=0.5"
        );

        tl.fromTo(
          ".rf-final-copy",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        );

        // Hold final state
        tl.to({}, { duration: 0.3 });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-canvas">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas via-canvas-soft to-canvas opacity-50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Stage 1: REDFLAG */}
        <div className="rf-redflag absolute inset-0 flex flex-col items-center justify-center">
          <h2
            className="font-heading text-7xl md:text-9xl font-extrabold tracking-tighter"
            style={{ color: "var(--signal-red)" }}
          >
            REDFLAG
          </h2>
          <p className="mt-6 text-text-secondary text-lg md:text-xl max-w-md text-center">
            Something unusual has been noticed.
          </p>
        </div>

        {/* Stage 2: Something changed */}
        <div className="rf-stage2 absolute inset-0 flex flex-col items-center justify-center opacity-0">
          <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-text-primary text-center">
            Something changed.
          </h2>
          <p className="mt-6 text-text-secondary text-base md:text-lg max-w-lg text-center leading-relaxed">
            Not every change is a problem. But the important ones should not be missed.
          </p>
          {/* Minimal activity visualization */}
          <div className="mt-12 flex items-end gap-1.5">
            {[68, 72, 70, 74, 71, 73, 72, 74, 71, 73, 42, 70, 72].map(
              (h, i) => (
                <div
                  key={i}
                  className="w-3 md:w-4 rounded-sm transition-all duration-300"
                  style={{
                    height: `${h}px`,
                    backgroundColor:
                      i === 10 ? "var(--signal-red)" : "var(--surface-raised)",
                  }}
                />
              )
            )}
          </div>
        </div>

        {/* Stage 3: Context changes everything */}
        <div className="rf-stage3 absolute inset-0 flex flex-col items-center justify-center opacity-0">
          <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-text-primary text-center">
            Context changes everything.
          </h2>
          <div className="rf-equation mt-12 flex flex-col items-center gap-4 text-text-secondary text-sm md:text-base">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-lg bg-surface-raised border border-border-subtle">
                A change
              </span>
            </div>
            <div className="text-text-muted">+</div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-lg bg-surface-raised border border-border-subtle">
                Related activity
              </span>
            </div>
            <div className="text-text-muted">+</div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-lg bg-surface-raised border border-border-subtle">
                Expected behaviour
              </span>
            </div>
            <div className="text-text-muted">=</div>
            <div className="flex items-center gap-3">
              <span
                className="px-4 py-2 rounded-lg border font-medium"
                style={{
                  backgroundColor: "var(--accent-green-soft)",
                  borderColor: "var(--accent-green-border)",
                  color: "var(--accent-green)",
                }}
              >
                A clearer signal
              </span>
            </div>
          </div>
        </div>

        {/* Stage 4: GREENLIGHT */}
        <div className="rf-greenlight absolute inset-0 flex flex-col items-center justify-center opacity-0">
          <h2
            className="font-heading text-7xl md:text-9xl font-extrabold tracking-tighter"
            style={{ color: "var(--accent-green)" }}
          >
            GREENLIGHT
          </h2>
          <div className="rf-final-copy opacity-0">
            <p className="mt-6 text-text-secondary text-lg md:text-xl max-w-lg text-center">
              From noticing what changed to knowing what needs attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
