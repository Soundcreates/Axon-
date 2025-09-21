import { useEffect, useRef } from "react";

export default function WaveBackdrop() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const dpi = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      c.width = c.clientWidth * dpi;
      c.height = c.clientHeight * dpi;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.006;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;

      // two smooth gradient waves
      for (let k=0; k<2; k++){
        const yBase = h * (0.35 + 0.12*k);
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x=0; x<w; x+=8){
          const y = yBase + Math.sin(x*0.003 + t*(1.2+k*0.6)) * 18 + Math.cos(x*0.002 - t*(0.8+k*0.4)) * 10;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "rgba(124,58,237,0.25)");
        grad.addColorStop(1, "rgba(34,211,238,0.25)");
        ctx.fillStyle = grad;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="waves" />;
}
