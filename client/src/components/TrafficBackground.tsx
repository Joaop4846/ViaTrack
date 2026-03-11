import { useEffect, useRef } from 'react';

interface BokehDot {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  phase: number;
  phaseSpeed: number;
  driftX: number;
  driftY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  driftSpeedX: number;
  driftSpeedY: number;
}

const BOKEH_COLORS = [
  'rgba(255, 255, 255,',
  'rgba(250, 250, 255,',
  'rgba(255, 250, 250,',
  'rgba(245, 245, 250,',
];

function createBokeh(width: number, height: number): BokehDot {
  const color = BOKEH_COLORS[Math.floor(Math.random() * BOKEH_COLORS.length)];
  const baseOpacity = 0.08 + Math.random() * 0.18;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 20 + Math.random() * 60,
    color,
    opacity: baseOpacity,
    baseOpacity,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.003 + Math.random() * 0.008,
    driftX: 0,
    driftY: 0,
    driftPhaseX: Math.random() * Math.PI * 2,
    driftPhaseY: Math.random() * Math.PI * 2,
    driftSpeedX: 0.001 + Math.random() * 0.003,
    driftSpeedY: 0.001 + Math.random() * 0.002,
  };
}

export function TrafficBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const DOT_COUNT = 35;
    const dots: BokehDot[] = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push(createBokeh(width, height));
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);

      for (const dot of dots) {
        dot.phase += dot.phaseSpeed;
        dot.opacity = dot.baseOpacity + Math.sin(dot.phase) * (dot.baseOpacity * 0.5);

        dot.driftPhaseX += dot.driftSpeedX;
        dot.driftPhaseY += dot.driftSpeedY;
        dot.driftX = Math.sin(dot.driftPhaseX) * 15;
        dot.driftY = Math.cos(dot.driftPhaseY) * 10;

        const drawX = dot.x + dot.driftX;
        const drawY = dot.y + dot.driftY;

        const gradient = ctx!.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, dot.radius
        );
        gradient.addColorStop(0, `${dot.color} ${dot.opacity})`);
        gradient.addColorStop(0.4, `${dot.color} ${dot.opacity * 0.4})`);
        gradient.addColorStop(1, `${dot.color} 0)`);

        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(drawX, drawY, dot.radius, 0, Math.PI * 2);
        ctx!.fill();

        const coreGradient = ctx!.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, dot.radius * 0.15
        );
        coreGradient.addColorStop(0, `${dot.color} ${Math.min(dot.opacity * 2.5, 0.6)})`);
        coreGradient.addColorStop(1, `${dot.color} 0)`);

        ctx!.fillStyle = coreGradient;
        ctx!.beginPath();
        ctx!.arc(drawX, drawY, dot.radius * 0.15, 0, Math.PI * 2);
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
