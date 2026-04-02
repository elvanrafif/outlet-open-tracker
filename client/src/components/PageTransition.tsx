import { createContext, useContext, useState, useRef } from "react";

interface TransitionContextValue {
  triggerTransition: (callback: () => void, direction?: "ltr" | "rtl") => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  triggerTransition: (cb) => cb(),
});

export const useTransition = () => useContext(TransitionContext);

type Phase = "idle" | "enter" | "exit";

export const PageTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerTransition = (callback: () => void, dir: "ltr" | "rtl" = "ltr") => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setDirection(dir);
    setPhase("enter");

    timerRef.current = setTimeout(() => {
      callback();
      setPhase("exit");

      timerRef.current = setTimeout(() => {
        setPhase("idle");
      }, 380);
    }, 380);
  };

  // Transform per phase + direction
  const transform = (() => {
    if (phase === "idle")  return direction === "ltr" ? "translateX(-100%)" : "translateX(100%)";
    if (phase === "enter") return "translateX(0%)";
    if (phase === "exit")  return direction === "ltr" ? "translateX(100%)"  : "translateX(-100%)";
    return "translateX(-100%)";
  })();

  return (
    <TransitionContext.Provider value={{ triggerTransition }}>
      {children}

      {/* Curtain overlay */}
      <div
        aria-hidden
        style={{
          transform,
          transition: phase === "idle" ? "none" : "transform 380ms cubic-bezier(0.76, 0, 0.24, 1)",
        }}
        className="fixed inset-0 z-[200] bg-primary pointer-events-none"
      />
    </TransitionContext.Provider>
  );
};
