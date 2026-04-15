'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

// ── SVG path data ─────────────────────────────────────────────────────────────

const PATHS = {
  redBelly:
    'M97.2094 49.0482C98.9318 57.1514 86.3143 66.6991 69.0274 70.3736C51.7405 74.048 36.3304 70.4578 34.608 62.3545C32.8856 54.2513 45.5031 44.7036 62.79 41.0291C80.0769 37.3547 95.487 40.9449 97.2094 49.0482Z',
  redBellyOutline:
    'M93.2968 49.8798C92.9487 48.2421 90.8108 45.8885 84.9289 44.5181C79.3899 43.2276 71.823 43.1985 63.6217 44.9417C55.4203 46.685 48.5195 49.7893 43.9842 53.2211C39.1683 56.8654 38.1725 59.8851 38.5206 61.5229C38.8687 63.1606 41.0067 65.5142 46.8885 66.8846C52.4275 68.1751 59.9944 68.2042 68.1957 66.461L69.0274 70.3736C51.7405 74.048 36.3304 70.4578 34.608 62.3545C32.8856 54.2513 45.5031 44.7036 62.79 41.0291C80.0769 37.3547 95.487 40.9449 97.2094 49.0482C98.9318 57.1514 86.3143 66.6991 69.0274 70.3736L68.1957 66.461C76.3971 64.7177 83.2979 61.6134 87.8332 58.1816C92.6491 54.5373 93.645 51.5176 93.2968 49.8798Z',
  blueDisc:
    'M117.836 35.4629C119.558 43.5661 96.8681 55.2548 67.1562 61.5702C37.4443 67.8857 11.9618 66.4364 10.2394 58.3332C8.51698 50.2299 31.2069 38.5413 60.9188 32.2258C90.6307 25.9104 116.113 27.3596 117.836 35.4629Z',
  blueDiscOutline:
    'M113.923 36.2945C113.921 36.2831 113.912 36.2441 113.863 36.1665C113.81 36.0826 113.699 35.9401 113.483 35.752C113.033 35.3588 112.242 34.8725 110.972 34.3898C108.419 33.4193 104.603 32.7132 99.6467 32.4313C89.7932 31.8708 76.3614 33.0327 61.7505 36.1384C47.1395 39.2441 34.3964 43.6458 25.6227 48.1655C21.2098 50.4389 18.0105 52.6363 16.0729 54.5613C15.1093 55.5187 14.5847 56.2846 14.3331 56.8271C14.2128 57.0865 14.1694 57.2618 14.1549 57.3601C14.1414 57.451 14.1495 57.4901 14.152 57.5015C14.1544 57.5129 14.1629 57.552 14.2121 57.6295C14.2654 57.7134 14.3763 57.856 14.5918 58.044C15.0422 58.4372 15.833 58.9236 17.1027 59.4062C19.6557 60.3767 23.4723 61.0829 28.4283 61.3648C38.2818 61.9252 51.7136 60.7633 66.3245 57.6576L67.1562 61.5702C37.4443 67.8857 11.9618 66.4364 10.2394 58.3332C8.51698 50.2299 31.2069 38.5413 60.9188 32.2258C90.6307 25.9104 116.113 27.3596 117.836 35.4629C119.558 43.5661 96.8681 55.2548 67.1562 61.5702L66.3245 57.6576C80.9355 54.552 93.6786 50.1502 102.452 45.6305C106.865 43.3572 110.065 41.1597 112.002 39.2347C112.966 38.2774 113.49 37.5115 113.742 36.969C113.862 36.7096 113.906 36.5342 113.92 36.4359C113.934 36.3451 113.925 36.306 113.923 36.2945Z',
  yellowDome:
    'M87.3051 40.93C86.6498 37.8471 85.3938 34.9235 83.6086 32.3261C81.8235 29.7287 79.5442 27.5083 76.9009 25.7918C74.2577 24.0752 71.3022 22.8961 68.2032 22.3218C65.1043 21.7474 61.9226 21.7891 58.8397 22.4443C55.7569 23.0996 52.8333 24.3557 50.2358 26.1408C47.6384 27.926 45.418 30.2053 43.7015 32.8485C41.9849 35.4918 40.8058 38.4473 40.2315 41.5462C39.6571 44.6452 39.6988 47.8269 40.354 50.9098C40.354 50.9098 45.6233 54.0561 64.6972 50.0018C83.7711 45.9475 87.3051 40.93 87.3051 40.93Z',
  yellowDomeOutline:
    'M59.419 22.3282C62.3201 21.7858 65.2981 21.7833 68.2032 22.3218C71.3022 22.8961 74.2577 24.0752 76.9009 25.7918C79.5442 27.5083 81.8235 29.7287 83.6086 32.3261C85.3938 34.9235 86.6498 37.8471 87.3051 40.93C87.3051 40.93 83.7711 45.9475 64.6972 50.0018L63.8655 46.089C73.1396 44.1177 78.4094 41.959 81.2564 40.4246C81.876 40.0907 82.3765 39.7859 82.778 39.5231C82.1885 37.777 81.3601 36.117 80.3121 34.5921C78.8245 32.4276 76.9254 30.5764 74.7227 29.1459C72.52 27.7155 70.0564 26.7335 67.474 26.2549C64.8916 25.7763 62.2403 25.8109 59.6714 26.3569C57.1024 26.903 54.6663 27.9498 52.5018 29.4373C50.3373 30.925 48.4861 32.824 47.0557 35.0268C45.6252 37.2295 44.6432 39.693 44.1646 42.2755C43.8274 44.0949 43.7449 45.9484 43.9166 47.7833C44.3904 47.8602 44.972 47.9347 45.6743 47.9878C48.8992 48.2316 54.5915 48.0602 63.8655 46.089L64.6972 50.0018L62.9495 50.361C45.2992 53.8625 40.354 50.9098 40.354 50.9098C39.7397 48.0197 39.6647 45.0427 40.1309 42.1285L40.2315 41.5462C40.8058 38.4473 41.9849 35.4918 43.7015 32.8485C45.3107 30.3706 47.3626 28.2124 49.7529 26.4814L50.2358 26.1408C52.8333 24.3557 55.7569 23.0996 58.8397 22.4443L59.419 22.3282Z',
  beamCone: 'M27 0H41L67.5 76.2913H0L27 0Z',
  beamConeOutline: 'M39.5771 2L64.6875 74.291H2.83008L28.4141 2H39.5771Z',
  beamEllipseOutline:
    'M34 66C43.2237 66 51.4883 67.3224 57.376 69.4004C60.3287 70.4425 62.5764 71.6373 64.0469 72.8643C65.5286 74.1007 66 75.17 66 76C66 76.83 65.5286 77.8993 64.0469 79.1357C62.5764 80.3627 60.3287 81.5575 57.376 82.5996C51.4883 84.6776 43.2237 86 34 86C24.7763 86 16.5117 84.6776 10.624 82.5996C7.67125 81.5575 5.42361 80.3627 3.95312 79.1357C2.47139 77.8993 2 76.83 2 76C2 75.17 2.47139 74.1007 3.95312 72.8643C5.42361 71.6373 7.67125 70.4425 10.624 69.4004C16.5117 67.3224 24.7763 66 34 66Z',
};

// ── Shadow filter ─────────────────────────────────────────────────────────────

function ShadowFilter({ id }: { id: string }) {
  return (
    <filter
      id={id}
      x="-5"
      y="15"
      width="139"
      height="80"
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="BackgroundImageFix" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset dy="2" />
      <feGaussianBlur stdDeviation="2" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset dy="1" />
      <feGaussianBlur stdDeviation="1" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
      <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
      <feBlend mode="normal" in2="effect2_dropShadow" result="effect3_dropShadow" />
      <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow" result="shape" />
    </filter>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpaceshipLogoV2Props {
  width?: number;
  interactive?: boolean;
  fleeRadius?: number;
  maxDisplacement?: number;
  beamDuration?: number;
  beamSkewRange?: number;
  disableMotion?: boolean;
  showBeam?: boolean;
  domeColor?: string;
  discColor?: string;
  bellyColor?: string;
  beamColor?: string;
  outlineOpacity?: number;
  className?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
}

// ── SpaceshipLogoV2 ───────────────────────────────────────────────────────────

export function SpaceshipLogoV2({
  width = 180,
  interactive = true,
  fleeRadius = 300,
  maxDisplacement = 100,
  beamDuration = 3,
  beamSkewRange = 15,
  disableMotion = false,
  showBeam = true,
  domeColor = '#F9C600',
  discColor = '#3C7DFF',
  bellyColor = '#F9614D',
  beamColor = '#26E6B5',
  outlineOpacity = 0.1,
  className,
  onMouseEnter,
}: SpaceshipLogoV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBeamVisible, setIsBeamVisible] = useState(true);
  const isBeamActiveRef = useRef(true);

  // Motion values for flee physics
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 18 });
  const y = useSpring(rawY, { stiffness: 80, damping: 18 });
  const rotate = useTransform(x, [-maxDisplacement, maxDisplacement], [-30, 30]);

  // Below Navbar size (<32px) get full outline opacity for legibility at small sizes
  const effectiveOutlineOpacity = width < 32 ? 1 : outlineOpacity;

  // Derived dimensions (saucer natural viewBox = 129×94, beam natural viewBox = 68×88)
  const scale = width / 129;
  const saucerH = Math.round(94 * scale);
  const beamW = Math.round(68 * scale);
  const beamH = Math.round(88 * scale);
  // The saucer viewBox has ~20 units of transparent whitespace at the bottom (content
  // ends at y≈74, viewBox goes to y=94). overlapPx must exceed those 20 units so the
  // beam top actually tucks behind the red belly rather than floating below it.
  const overlapPx = Math.round(38 * scale);
  const totalH = saucerH + beamH - overlapPx;
  const beamLeft = Math.round((width - beamW) / 2);
  const beamTop = saucerH - overlapPx;

  // Mouse-flee logic
  useEffect(() => {
    if (!interactive || disableMotion) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < fleeRadius) {
        const strength = (fleeRadius - dist) / fleeRadius;
        const fleeX = -(dx / dist) * strength * maxDisplacement;
        const fleeY = -(dy / dist) * strength * maxDisplacement;
        rawX.set(Math.max(-maxDisplacement, Math.min(maxDisplacement, fleeX)));
        rawY.set(Math.max(-maxDisplacement, Math.min(maxDisplacement, fleeY)));
        if (isBeamActiveRef.current) {
          isBeamActiveRef.current = false;
          setIsBeamVisible(false);
        }
      } else {
        rawX.set(0);
        rawY.set(0);
        if (!isBeamActiveRef.current) {
          isBeamActiveRef.current = true;
          setIsBeamVisible(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, disableMotion, fleeRadius, maxDisplacement, rawX, rawY]);

  const beamSvg = (
    <svg width={beamW} height={beamH} viewBox="0 0 68 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={PATHS.beamCone} fill={beamColor} fillOpacity="0.5" />
      <path d={PATHS.beamConeOutline} stroke="black" strokeOpacity={effectiveOutlineOpacity} strokeWidth="4" fill="none" />
      <ellipse cx="34" cy="76" rx="34" ry="12" fill={beamColor} />
      <path d={PATHS.beamEllipseOutline} stroke="black" strokeOpacity={effectiveOutlineOpacity} strokeWidth="4" fill="none" />
    </svg>
  );

  const saucerSvg = (
    <svg width={width} height={saucerH} viewBox="0 0 129 94" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <ShadowFilter id="v2-shadow" />
      </defs>
      <g filter="url(#v2-shadow)">
        <path d={PATHS.redBelly} fill={bellyColor} />
        <path d={PATHS.redBellyOutline} fill="black" fillOpacity={effectiveOutlineOpacity} />
        <path d={PATHS.blueDisc} fill={discColor} />
        <path d={PATHS.blueDiscOutline} fill="black" fillOpacity={effectiveOutlineOpacity} />
        <path d={PATHS.yellowDome} fill={domeColor} />
        <path d={PATHS.yellowDomeOutline} fill="black" fillOpacity={effectiveOutlineOpacity} />
      </g>
    </svg>
  );

  const containerH = showBeam ? totalH : saucerH;

  if (disableMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width, height: containerH, position: 'relative' }}
      >
        {showBeam && (
          <div style={{ position: 'absolute', top: beamTop, left: beamLeft, zIndex: 0 }}>
            {beamSvg}
          </div>
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }} onMouseEnter={onMouseEnter}>
          {saucerSvg}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ x, y, rotate, width, height: containerH, position: 'relative' }}
    >
      {/* Beam layer — opacity wrapper keeps fade separate from the skew loop */}
      {showBeam && (
        <motion.div
          style={{ position: 'absolute', top: beamTop, left: beamLeft, zIndex: 0 }}
          animate={{ opacity: isBeamVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={{ transformOrigin: 'top center' }}
            animate={{ skewX: [-beamSkewRange, beamSkewRange] }}
            transition={{ repeat: Infinity, repeatType: 'mirror', duration: beamDuration / 2, ease: 'easeInOut' }}
          >
            {beamSvg}
          </motion.div>
        </motion.div>
      )}

      {/* Saucer layer — onMouseEnter scoped here so only the saucer body triggers events */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }} onMouseEnter={onMouseEnter}>
        {saucerSvg}
      </div>
    </motion.div>
  );
}
