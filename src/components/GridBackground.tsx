import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
}

const GAP = 28;
const SIZE = 4;
const RADIUS = 180;
const MAX_FORCE = 0.35;
const SPRING = 0.04;
const DAMPING = 0.88;

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      initParticles();
    };

    const initParticles = () => {
      const particles: Particle[] = [];
      const cols = Math.floor(w / GAP) + 2;
      const rows = Math.floor(h / GAP) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP + GAP / 2;
          const y = r * GAP + GAP / 2;
          particles.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0 });
        }
      }
      particlesRef.current = particles;
    };

    const animate = () => {
      if (!ctx) return;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        // Attraction toward mouse
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS && dist > 0.1) {
          const force = (1 - dist / RADIUS) * MAX_FORCE;
          const nx = dx / dist;
          const ny = dy / dist;
          p.vx += nx * force;
          p.vy += ny * force;
        }

        // Spring back to home
        p.vx += (p.homeX - p.x) * SPRING;
        p.vy += (p.homeY - p.y) * SPRING;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Calculate glow based on distance to mouse
        const d2m = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
        const glow = d2m < RADIUS ? 1 - d2m / RADIUS : 0;

        const r = Math.round(59 + glow * 150);
        const g = Math.round(130 + glow * 50);
        const b = Math.round(246);
        const alpha = 0.12 + glow * 0.55;

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(p.x - SIZE / 2, p.y - SIZE / 2, SIZE, SIZE);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#fafbfc' }}
    />
  );
}
