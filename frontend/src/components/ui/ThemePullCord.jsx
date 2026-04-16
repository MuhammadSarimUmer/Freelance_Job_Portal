import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemePullCord() {
  const { toggleTheme, isDark } = useTheme();
  
  const [offsetY, setOffsetY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const isPullingRef = useRef(false);
  const startY = useRef(0);
  
  // Spring physics variables
  const py = useRef(0);
  const vy = useRef(0);
  const animationRef = useRef(null);
  
  // Trigger threshold
  const triggerThreshold = 80;

  const startPull = (clientY) => {
    setIsPulling(true);
    isPullingRef.current = true;
    startY.current = clientY - py.current;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const pull = (clientY) => {
    if (!isPullingRef.current) return;
    const dy = clientY - startY.current;
    
    // Add resistance when pulling far
    const maxPull = 140;
    let pulledY = dy;
    
    if (dy > triggerThreshold) {
       // Resistance after passing threshold
       pulledY = triggerThreshold + (dy - triggerThreshold) * 0.4;
    }
    
    // Hard cap
    if (pulledY > maxPull) pulledY = maxPull;
    
    py.current = Math.max(0, pulledY);
    setOffsetY(py.current);
  };

  const endPull = () => {
    setIsPulling(false);
    isPullingRef.current = false;
    
    if (py.current >= triggerThreshold) {
      toggleTheme();
    }
    
    // Release physics
    const springTick = () => {
      if (isPullingRef.current) return;
      
      // Spring constants
      const tension = 0.18;
      const friction = 0.75;
      
      const force = (0 - py.current) * tension;
      vy.current = (vy.current + force) * friction;
      py.current += vy.current;
      
      // Prevent visual clipping into negative space if too fast
      setOffsetY(py.current);
      
      if (Math.abs(vy.current) > 0.1 || Math.abs(py.current) > 0.1) {
        animationRef.current = requestAnimationFrame(springTick);
      } else {
        py.current = 0;
        vy.current = 0;
        setOffsetY(0);
      }
    };
    animationRef.current = requestAnimationFrame(springTick);
  };

  // Global mouse/touch event listeners to ensure tracking when moving fast
  useEffect(() => {
    const handleUp = () => isPullingRef.current && endPull();
    const handleMove = (e) => {
      if (isPullingRef.current) {
        // Prevent scrolling while pulling
        if (e.cancelable) e.preventDefault();
        pull(e.touches ? e.touches[0].clientY : e.clientY);
      }
    };
    
    if (isPulling) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isPulling]);

  return (
    <div
      style={{
        position: "relative",
        width: "20px",
        height: "30px",
        display: "flex",flexDirection: "column", alignItems: "center",
        WebkitUserSelect: "none", userSelect: "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-12px", // offset navbar padding
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
      {/* Base fixture */}
      <div 
        style={{
          width: "16px",
          height: "6px",
          background: isDark ? "var(--color-surface-container-highest)" : "var(--color-outline-variant-strong)",
          borderBottomLeftRadius: "4px",
          borderBottomRightRadius: "4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}
      />
      {/* Cord */}
      <div
        style={{
          width: "2px",
          height: `${24 + offsetY}px`,
          backgroundColor: isDark ? "var(--color-outline)" : "var(--color-outline-variant-strong)",
          transformOrigin: "top center",
        }}
      />
      {/* Light Indicator on Pull */}
      <div 
        style={{
          position: "absolute",
          top: "24px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: offsetY >= triggerThreshold ? "var(--color-primary)" : "var(--color-outline-variant)",
          transform: `translateY(${offsetY}px)`,
          transition: "background 0.2s ease, box-shadow 0.2s ease",
          boxShadow: offsetY >= triggerThreshold 
            ? "0 0 10px var(--color-glow-teal)" 
            : "none",
          marginTop: "-4px"
        }}
      />
      {/* Handle */}
      <div
        onMouseDown={(e) => startPull(e.clientY)}
        onTouchStart={(e) => startPull(e.touches[0].clientY)}
        style={{
          width: "12px",
          height: "24px",
          borderRadius: "6px",
          backgroundColor: isDark ? "var(--color-primary)" : "var(--color-secondary)",
          cursor: isPulling ? "grabbing" : "grab",
          transform: `scaleY(${isPulling ? 1.05 : 1})`,
          transition: "transform 0.1s ease, background-color 0.4s ease",
          boxShadow: isDark 
               ? "0 4px 10px rgba(227, 116, 52, 0.4)" 
               : "0 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      />
      </div>
    </div>
  );
}
