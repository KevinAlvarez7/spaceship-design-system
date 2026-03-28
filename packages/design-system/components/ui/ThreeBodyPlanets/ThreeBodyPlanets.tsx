'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';
import { SpaceshipPlanet } from '../SpaceshipLogo/SpaceshipPlanet';

// ── Physics constants ─────────────────────────────────────────────────────────

const G = 60;            // gravitational constant — stronger pull for more dramatic interactions
const SOFTENING = 0.5;   // very small softening → allows close passes before force saturates
const DAMPING = 0.999;   // less energy loss → orbits stay lively longer
const RESTORING_K = 0.05; // much weaker centering → planets use the full container
const SUB_STEPS = 4;     // integration sub-steps per frame → smooth slingshots, genuine crossings

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ThreeBodyPlanetsProps {
  /** Container diameter in px. Default 48. */
  size?: number;
  /** Each planet diameter in px. Default 14. */
  planetSize?: number;
  /** Exactly 3 CSS colors. Default: lilac, mint, blue. */
  colors?: [string, string, string];
  /** Simulation speed multiplier. Default 1. */
  speed?: number;
  /** Render a static triangular fallback; no animation. */
  disableMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ── Physics state ─────────────────────────────────────────────────────────────

interface Vec2 { x: number; y: number }

interface Body {
  pos: Vec2;
  vel: Vec2;
}

function makeInitialBodies(radius: number): Body[] {
  // Asymmetric angles (not evenly spaced) seed chaotic divergence
  const angles = [0, 2.3, 4.1];
  // Asymmetric speeds — higher kinetic energy means planets can cross each other's paths
  const speeds = [0.6, 1.0, 1.4];
  return angles.map((angle, i) => ({
    pos: { x: Math.cos(angle) * radius * 0.75, y: Math.sin(angle) * radius * 0.75 },
    // Perpendicular velocity — each body has a different magnitude
    vel: { x: -Math.sin(angle) * speeds[i], y: Math.cos(angle) * speeds[i] },
  }));
}

// ── ThreeBodyPlanets ──────────────────────────────────────────────────────────

const DEFAULT_COLORS: [string, string, string] = ['#C3A8FF', '#26E6B5', '#3C7DFF'];

export function ThreeBodyPlanets({
  size = 120,
  planetSize = 14,
  colors = DEFAULT_COLORS,
  speed = 1,
  disableMotion = false,
  className,
  style,
}: ThreeBodyPlanetsProps) {
  const maxRadius = (size - planetSize) / 2;

  // MotionValues — DOM updates without React re-renders
  const x0 = useMotionValue(0);
  const y0 = useMotionValue(0);
  const x1 = useMotionValue(0);
  const y1 = useMotionValue(0);
  const x2 = useMotionValue(0);
  const y2 = useMotionValue(0);

  const xValues = [x0, x1, x2];
  const yValues = [y0, y1, y2];

  // Mutable physics state — lives in a ref so it never triggers re-renders
  const bodiesRef = useRef<Body[]>([]);

  // Lazy-initialize bodies on first frame
  if (bodiesRef.current.length === 0) {
    bodiesRef.current = makeInitialBodies(maxRadius);
  }

  useAnimationFrame((_time, delta) => {
    if (disableMotion) return;

    // Clamp delta to avoid large jumps after tab switch
    const dtFull = Math.min(delta, 32) * 0.001 * speed;
    const dt = dtFull / SUB_STEPS;
    const bodies = bodiesRef.current;

    // Sub-stepping: apply force incrementally so close approaches produce
    // smooth slingshots instead of a single giant velocity kick (bounce)
    for (let s = 0; s < SUB_STEPS; s++) {
      // Compute pairwise gravitational forces
      const forces: Vec2[] = bodies.map(() => ({ x: 0, y: 0 }));

      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          const dx = bodies[j].pos.x - bodies[i].pos.x;
          const dy = bodies[j].pos.y - bodies[i].pos.y;
          const r2 = dx * dx + dy * dy + SOFTENING * SOFTENING;
          const r = Math.sqrt(r2);
          const f = G / r2;
          const fx = f * (dx / r);
          const fy = f * (dy / r);
          forces[i].x += fx;
          forces[i].y += fy;
          forces[j].x -= fx;
          forces[j].y -= fy;
        }
      }

      // Integrate: update velocities and positions
      for (let i = 0; i < 3; i++) {
        const body = bodies[i];

        // Add restoring force toward center
        forces[i].x -= RESTORING_K * body.pos.x;
        forces[i].y -= RESTORING_K * body.pos.y;

        // Semi-implicit Euler integration
        body.vel.x = (body.vel.x + forces[i].x * dt) * DAMPING;
        body.vel.y = (body.vel.y + forces[i].y * dt) * DAMPING;
        body.pos.x += body.vel.x * dt * 60; // × 60 normalizes to ~60fps units
        body.pos.y += body.vel.y * dt * 60;

        // Elastic boundary reflection — preserve tangential speed, reflect radial
        const dist = Math.sqrt(body.pos.x * body.pos.x + body.pos.y * body.pos.y);
        if (dist > maxRadius) {
          const s = maxRadius / dist;
          body.pos.x *= s;
          body.pos.y *= s;
          // Reflect only the outward radial velocity component
          const nx = body.pos.x / maxRadius;
          const ny = body.pos.y / maxRadius;
          const vDotN = body.vel.x * nx + body.vel.y * ny;
          if (vDotN > 0) { // only flip if moving outward
            body.vel.x -= 2 * vDotN * nx;
            body.vel.y -= 2 * vDotN * ny;
          }
          // Small energy loss on bounce
          body.vel.x *= 0.95;
          body.vel.y *= 0.95;
        }
      }
    }

    // Flush to MotionValues
    xValues[0].set(bodies[0].pos.x);
    yValues[0].set(bodies[0].pos.y);
    xValues[1].set(bodies[1].pos.x);
    yValues[1].set(bodies[1].pos.y);
    xValues[2].set(bodies[2].pos.x);
    yValues[2].set(bodies[2].pos.y);
  });

  // ── disableMotion fallback ─────────────────────────────────────────────────

  if (disableMotion) {
    const fallbackAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    const r = maxRadius * 0.5;
    return (
      <div className={className} style={{ position: 'relative', width: size, height: size, ...style }}>
        {fallbackAngles.map((angle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: -planetSize / 2,
              marginTop: -planetSize / 2,
              transform: `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px)`,
            }}
          >
            <SpaceshipPlanet color={colors[i]} size={planetSize} />
          </div>
        ))}
      </div>
    );
  }

  // ── Animated render ────────────────────────────────────────────────────────

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size, ...style }}>
      {([0, 1, 2] as const).map(i => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            x: xValues[i],
            y: yValues[i],
            marginLeft: -planetSize / 2,
            marginTop: -planetSize / 2,
            willChange: 'transform',
          }}
        >
          <SpaceshipPlanet color={colors[i]} size={planetSize} />
        </motion.div>
      ))}
    </div>
  );
}
