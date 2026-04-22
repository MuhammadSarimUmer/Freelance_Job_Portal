import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function PageTransition({ children }) {
  const location = useLocation();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.classList.remove("page-enter-active");
    el.classList.add("page-enter");
    const raf = requestAnimationFrame(() => {
      el.classList.add("page-enter-active");
      el.classList.remove("page-enter");
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div ref={wrapperRef} className="page-enter-active" style={{ display: "contents" }}>
      {children}
    </div>
  );
}

export default PageTransition;
