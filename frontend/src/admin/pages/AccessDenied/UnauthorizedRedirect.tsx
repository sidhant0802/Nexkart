import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Sparkles } from "lucide-react";

const UnauthorizedRedirect = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"showing" | "exiting">("showing");

  useEffect(() => {
    // Hold for 2s, then trigger exit
    const exitTimer = setTimeout(() => setPhase("exiting"), 2000);
    // After exit animation (700ms), redirect
    const redirectTimer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2700);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <AnimatePresence>
      {phase === "showing" && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(20px)",
            transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
          }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "rgba(8, 8, 16, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* ── Animated background orbs ── */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.2), transparent 70%)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* ── Floating particles ── */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* ── Main content ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.2,
            }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
          >
            {/* ── Animated emoji/icon stack ── */}
            <div className="relative mb-8">
              {/* Outer pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(239,68,68,0.4), transparent 60%)",
                  width: 140,
                  height: 140,
                  marginLeft: -10,
                  marginTop: -10,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />

              {/* Orbiting sparkles */}
              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: 8,
                    height: 8,
                    marginLeft: -4,
                    marginTop: -4,
                  }}
                  animate={{
                    rotate: [angle, angle + 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: i % 2 === 0 ? "#ef4444" : "#a855f7",
                      boxShadow: `0 0 12px ${i % 2 === 0 ? "#ef4444" : "#a855f7"}`,
                      transform: `translateX(60px)`,
                    }}
                  />
                </motion.div>
              ))}

              {/* Main shield icon container */}
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="relative w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626, #991b1b)",
                    boxShadow: "0 0 60px rgba(239,68,68,0.6), inset 0 2px 8px rgba(255,255,255,0.2)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 60px rgba(239,68,68,0.6), inset 0 2px 8px rgba(255,255,255,0.2)",
                      "0 0 90px rgba(239,68,68,0.9), inset 0 2px 8px rgba(255,255,255,0.3)",
                      "0 0 60px rgba(239,68,68,0.6), inset 0 2px 8px rgba(255,255,255,0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Lock icon */}
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                  >
                    <Lock size={52} color="white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Sparkle accent */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles size={24} color="#fbbf24" fill="#fbbf24" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* ── Title ── */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl font-black mb-3"
              style={{
                background: "linear-gradient(135deg, #fff 30%, #ef4444 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                textShadow: "0 0 40px rgba(239,68,68,0.3)",
              }}
            >
              Admins Only 🛡️
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-white/60 text-sm mb-8"
              style={{ lineHeight: 1.6 }}
            >
              This area is locked. We're sending you back to where the magic happens ✨
            </motion.p>

            {/* ── Spinner + status ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Spinner */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2px solid rgba(168,85,247,0.2)",
                  borderTopColor: "#a855f7",
                  borderRightColor: "#a855f7",
                }}
              />

              <span className="text-white/80 text-sm font-medium">
                Redirecting to{" "}
                <motion.span
                  animate={{
                    color: ["#a855f7", "#ec4899", "#a855f7"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-bold"
                >
                  Storefront
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  ...
                </motion.span>
              </span>
            </motion.div>

            {/* ── Footer hint ── */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-white/25 text-[11px] mt-6 flex items-center gap-1.5"
            >
              <Shield size={11} />
              Nexkart Security · Access attempt logged
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnauthorizedRedirect;