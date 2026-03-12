import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export const NoResumeState = () => {
    const [pulse, setPulse] = useState(0);
    const [orbiting, setOrbiting] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse((p) => (p + 1) % 100);
            setOrbiting((o) => (o + 0.5) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const orbitX = Math.cos((orbiting * Math.PI) / 180) * 52;
    const orbitY = Math.sin((orbiting * Math.PI) / 180) * 52;
    const orbitX2 = Math.cos(((orbiting + 120) * Math.PI) / 180) * 52;
    const orbitY2 = Math.sin(((orbiting + 120) * Math.PI) / 180) * 52;
    const orbitX3 = Math.cos(((orbiting + 240) * Math.PI) / 180) * 52;
    const orbitY3 = Math.sin(((orbiting + 240) * Math.PI) / 180) * 52;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            padding: "24px 16px",
            width: "100%",
        }}>
            {/* Central visual */}
            <div style={{ position: "relative", width: "140px", height: "140px" }}>
                {/* Outer ring glow */}
                <div style={{
                    position: "absolute",
                    inset: "-8px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,255,163,0.08) 0%, transparent 70%)",
                    animation: "breathe 3s ease-in-out infinite",
                }} />

                {/* Dashed orbit ring */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <circle
                        cx="70" cy="70" r="52"
                        fill="none"
                        stroke="rgba(0,255,163,0.2)"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                    />
                    <circle
                        cx="70" cy="70" r="36"
                        fill="none"
                        stroke="rgba(0,212,255,0.15)"
                        strokeWidth="1"
                        strokeDasharray="3 8"
                    />
                </svg>

                {/* Orbiting dots */}
                <div style={{
                    position: "absolute",
                    left: `${70 + orbitX - 5}px`,
                    top: `${70 + orbitY - 5}px`,
                    width: "10px", height: "10px",
                    borderRadius: "50%",
                    background: "#00FFA3",
                    boxShadow: "0 0 12px #00FFA3",
                }} />
                <div style={{
                    position: "absolute",
                    left: `${70 + orbitX2 - 4}px`,
                    top: `${70 + orbitY2 - 4}px`,
                    width: "8px", height: "8px",
                    borderRadius: "50%",
                    background: "#00D4FF",
                    boxShadow: "0 0 10px #00D4FF",
                }} />
                <div style={{
                    position: "absolute",
                    left: `${70 + orbitX3 - 3}px`,
                    top: `${70 + orbitY3 - 3}px`,
                    width: "6px", height: "6px",
                    borderRadius: "50%",
                    background: "#A78BFA",
                    boxShadow: "0 0 8px #A78BFA",
                }} />

                {/* Center brain/AI icon */}
                <div style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "60px", height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0D1F2D 0%, #1a2f45 100%)",
                    border: "1.5px solid rgba(0,255,163,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 20px rgba(0,255,163,0.2), inset 0 0 20px rgba(0,0,0,0.5)",
                }}>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        {/* Stylized AI brain */}
                        <path d="M8 10 Q8 6 12 6 Q14 4 16 5 Q19 4 20 7 Q23 7 23 11 Q25 13 23 15 Q24 18 21 19 Q20 22 17 21 Q15 23 13 21 Q10 22 10 19 Q7 17 8 15 Q6 13 8 10Z"
                            fill="none" stroke="rgba(0,255,163,0.7)" strokeWidth="1.2" />
                        <circle cx="12" cy="13" r="1.5" fill="#00FFA3" opacity="0.8" />
                        <circle cx="18" cy="13" r="1.5" fill="#00FFA3" opacity="0.8" />
                        <circle cx="15" cy="17" r="1.2" fill="#00D4FF" opacity="0.8" />
                        <line x1="12" y1="13" x2="15" y2="17" stroke="rgba(0,255,163,0.4)" strokeWidth="0.8" />
                        <line x1="18" y1="13" x2="15" y2="17" stroke="rgba(0,255,163,0.4)" strokeWidth="0.8" />
                        <line x1="12" y1="13" x2="18" y2="13" stroke="rgba(0,212,255,0.3)" strokeWidth="0.8" />
                    </svg>
                </div>
            </div>

            {/* Text content */}
            <div style={{ textAlign: "center" }}>
                <p style={{
                    color: "#E2E8F0",
                    fontWeight: "600",
                    fontSize: "15px",
                    marginBottom: "8px",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.01em",
                }}>
                    No Resume Uploaded
                </p>
                <p style={{
                    color: "rgba(148,163,184,0.8)",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    Ask the candidate to upload a resume to enable AI analysis
                </p>
            </div>

            <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
        </div>
    );
};

export const MatchedState = ({ score = 0, skills = [] }) => {
    const [animScore, setAnimScore] = useState(0);

    useEffect(() => {
        let current = 0;
        const target = score;
        const step = target / 60;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setAnimScore(Math.round(current));
            if (current >= target) clearInterval(timer);
        }, 20);
        return () => clearInterval(timer);
    }, [score]);

    // Fallback skills if none are provided
    const displaySkills = skills.length > 0 ? skills : [
        { label: "Overall Match", score: score, color: "#00FFA3" },
        { label: "Technical Skills", score: Math.max(0, score - 5), color: "#00D4FF" },
        { label: "Experience Match", score: Math.max(0, score - 8), color: "#A78BFA" }
    ];

    const circumference = 2 * Math.PI * 40;
    const dash = (animScore / 100) * circumference;

    const getMatchText = () => {
        if (score >= 70) return "STRONG MATCH";
        if (score >= 50) return "GOOD MATCH";
        return "WEAK MATCH";
    };

    const getMatchColor = () => {
        if (score >= 70) return "#00FFA3";
        if (score >= 50) return "#00D4FF";
        return "#F59E0B";
    };

    return (
        <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}>
            {/* Score ring */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={getMatchColor()} />
                                <stop offset="100%" stopColor="#00D4FF" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none"
                            stroke="url(#scoreGrad)"
                            strokeWidth="8"
                            strokeDasharray={`${dash} ${circumference}`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            style={{ transition: "stroke-dasharray 0.05s linear" }}
                        />
                    </svg>
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: getMatchColor(), fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
                            {animScore}%
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(148,163,184,0.7)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>
                            MATCH
                        </div>
                    </div>
                </div>

                <div>
                    <div style={{
                        display: "inline-block",
                        background: `rgba(${score >= 70 ? '0,255,163' : score >= 50 ? '0,212,255' : '245,158,11'}, 0.12)`,
                        border: `1px solid rgba(${score >= 70 ? '0,255,163' : score >= 50 ? '0,212,255' : '245,158,11'}, 0.3)`,
                        borderRadius: "20px",
                        padding: "3px 10px",
                        color: getMatchColor(),
                        fontSize: "10px",
                        fontWeight: "700",
                        letterSpacing: "0.06em",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: "6px",
                    }}>
                        {getMatchText()}
                    </div>
                    <p style={{ color: "rgba(148,163,184,0.9)", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, margin: 0 }}>
                        {score >= 70 ? "This candidate aligns well with your job requirements" : 
                         score >= 50 ? "This candidate has potential for the role" : 
                         "This candidate may lack key requirements"}
                    </p>
                </div>
            </div>

        </div>
    );
};

export const LoadingState = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            padding: "24px 16px",
            width: "100%",
        }}>
            <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                    position: "absolute",
                    inset: "0",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)",
                    animation: "breathe 2s ease-in-out infinite",
                }} />
                 <Loader2 className="animate-spin text-[#00D4FF]" size={40} strokeWidth={2.5} />
            </div>

            <div style={{ textAlign: "center" }}>
                <p style={{
                    color: "#E2E8F0",
                    fontWeight: "600",
                    fontSize: "15px",
                    marginBottom: "8px",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.01em",
                }}>
                    Analyzing Resume...
                </p>
                <p style={{
                    color: "rgba(148,163,184,0.8)",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    ⏳ Please wait while AI processes the profile
                </p>
            </div>
        </div>
    );
};
