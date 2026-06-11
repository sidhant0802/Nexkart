import React, { useState, useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent, useEffect } from "react";
import { motion } from "framer-motion";

interface OTPInputProps {
  length: number;
  onChange: (otp: string) => void;
  error?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, onChange, error = false }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    onChange(otp.join(""));
  }, [otp]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < length - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  // ✅ Paste support
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (!pasted) return;
    const newOtp = Array(length).fill("");
    pasted.split("").forEach((c, i) => (newOtp[i] = c));
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          id={`otp-input-${index}`}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          maxLength={1}
          autoComplete="off"
          whileFocus={{ scale: 1.05 }}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl outline-none transition-all"
          style={{
            background: error
              ? "rgba(239,68,68,0.08)"
              : digit
              ? "rgba(139,92,246,0.12)"
              : "rgba(255,255,255,0.04)",
            border: error
              ? "1.5px solid rgba(239,68,68,0.5)"
              : digit
              ? "1.5px solid rgba(139,92,246,0.6)"
              : "1.5px solid rgba(255,255,255,0.1)",
            color: "white",
            boxShadow: digit ? "0 0 20px rgba(139,92,246,0.2)" : "none",
            caretColor: "#a78bfa",
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput;