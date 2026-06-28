import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle2, LayoutGrid, Zap, Shield, Sparkles } from "lucide-react";
import { Page } from "../types";

export default function LandingPage({ setPage }: { setPage: (p: Page) => void }) {
  const shouldReduceMotion = useReducedMotion();
  const gradText = "bg-gradient-to-r from-[#ff2d78] via-[#ff6eb0] to-[#2d6aff] bg-clip-text text-transparent";

  const features = [
    { title: "Real-time Sync", desc: "Your tasks are instantly saved to MongoDB, perfectly synchronized.", icon: Zap, color: "#ff2d78" },
    { title: "Glassmorphic UI", desc: "Stunning Figma-grade design with deep dark mode aesthetics.", icon: LayoutGrid, color: "#2d6aff" },
    { title: "Secure APIs", desc: "Zod validated endpoints with robust JWT authentication.", icon: Shield, color: "#30d158" },
  ];

  return (
    <div className="min-h-screen bg-[#060612] font-['Plus_Jakarta_Sans'] overflow-hidden flex flex-col items-center justify-center relative">
      {/* Ambient background */}
      {/* WHY: Absolute positioning with pointer-events-none ensures these ambient decorative elements do not capture clicks or interfere with the user's interaction with the main content. */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={shouldReduceMotion ? { opacity: 0.3 } : { scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full bg-[#ff2d78]/10 blur-[120px] md:blur-[150px]"
        />
        <motion.div
          animate={shouldReduceMotion ? { opacity: 0.3 } : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 md:w-[600px] md:h-[600px] rounded-full bg-[#2d6aff]/10 blur-[120px] md:blur-[150px]"
        />
      </div>

      {/* 3D Floating Elements */}
      {/* WHY: We use Framer Motion for these heavy animations because it utilizes hardware-accelerated CSS transforms (translate, rotate, scale) rather than layout-triggering properties (like top/left), ensuring buttery-smooth 60fps performance without browser repaints. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center z-0">
        <motion.div
          animate={shouldReduceMotion ? { opacity: 0.8 } : { y: [0, -40, 0], rotateX: [0, 20, 0], rotateY: [0, 45, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block absolute left-[5%] md:left-[15%] top-[20%] w-24 h-24 md:w-32 md:h-32 rounded-3xl"
          style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(45,106,255,0.15))", backdropFilter: "blur(10px)", border: "1px solid rgba(255,45,120,0.3)", transformStyle: "preserve-3d", boxShadow: "0 20px 40px rgba(255,45,120,0.2)" }}
        />
        <motion.div
          animate={shouldReduceMotion ? { opacity: 0.8 } : { y: [0, 50, 0], rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden md:block absolute right-[5%] md:right-[15%] bottom-[20%] w-20 h-20 md:w-28 md:h-28 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(45,106,255,0.4), rgba(255,45,120,0.1))", border: "1px solid rgba(45,106,255,0.3)", boxShadow: "0 0 40px rgba(45,106,255,0.3)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 py-20 flex flex-col items-center text-center overflow-hidden">
        {/* Floating 3D Badge */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold font-mono"
            style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.2)", color: "#ff2d78" }}>
            <Sparkles className="w-4 h-4" /> Next-Generation Task Management
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black font-['Syne'] text-white mb-6 tracking-tight leading-tight relative"
        >
          Manage tasks like never <br className="hidden md:block" />
          before with{" "}
          <motion.span
            animate={{ textShadow: ["0px 0px 10px rgba(255,45,120,0.4)", "0px 0px 25px rgba(45,106,255,0.8)", "0px 0px 10px rgba(255,45,120,0.4)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`${gradText} inline-block`}
          >
            TaskTrack
          </motion.span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-[#9090b8] max-w-2xl mb-12 leading-relaxed"
        >
          TaskTrack is the ultimate full-stack productivity tool. Built with the MERN stack, it offers a premium, glassmorphic experience that completely outperforms generic to-do apps.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-20"
        >
          <button onClick={() => setPage("auth")}
            className="group flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #ff2d78, #2d6aff)", boxShadow: "0 0 40px rgba(255,45,120,0.4)" }}>
            Get Started Now
            <motion.div groupHover={{ x: 5 }} transition={{ type: "spring" }}>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </button>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="group relative rounded-3xl p-8 text-left overflow-hidden transition-all duration-500 hover:-translate-y-2"
              style={{ background: "#0d0d22", border: `1px solid ${f.color}33`, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top right, ${f.color}, transparent)` }} />
              
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}33` }}>
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <h3 className="text-xl font-bold font-['Syne'] text-white mb-3 relative z-10">{f.title}</h3>
              <p className="text-[#9090b8] leading-relaxed relative z-10">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Why Us Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24 w-full max-w-4xl rounded-3xl p-6 md:p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.05), rgba(45,106,255,0.05))", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #ff2d78, #2d6aff)" }} />
          <h2 className="text-2xl md:text-3xl font-black font-['Syne'] text-white mb-6">Why is TaskTrack Better?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              "Not just a basic React template—it's full-stack.",
              "Bank-grade security with JWT and Zod validation.",
              "Beautiful, meticulously crafted Figma UI.",
              "No AI-generated generic templates."
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#30d158] shrink-0" />
                <span className="text-[#f0efff]">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
