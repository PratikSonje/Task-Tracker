import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, ArrowRight, Mail, Lock, User, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { setToken, api } from "../../app/api";
import { Page } from "../../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthScreen({ setPage, onLogin }: { setPage: (p: Page) => void; onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const gradText = "bg-gradient-to-r from-[#ff2d78] via-[#ff6eb0] to-[#2d6aff] bg-clip-text text-transparent";
  const inputCls = "w-full rounded-xl px-11 py-3 text-sm text-white placeholder-[#9090b8] focus:outline-none transition-all duration-200 font-['Plus_Jakarta_Sans']";
  const inputStyle = { background: "#13132b", border: "1px solid rgba(255,255,255,0.08)" };
  const inputFocusStyle = "focus:border-[#ff2d78]/50 focus:ring-2 focus:ring-[#ff2d78]/10";

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      const result = isLogin ? await api.login(data) : await api.register(data);
      
      setToken(result.data.token);
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      onLogin();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsLogin(!isLogin);
    reset();
  }

  return (
    <div className="min-h-screen bg-[#060612] font-['Plus_Jakarta_Sans'] flex items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#ff2d78]/10 blur-[120px]" />
        <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#2d6aff]/10 blur-[150px]" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-8 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #0d0d22, #12102e)", border: "1px solid rgba(255,45,120,0.2)" }}>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black font-['Syne'] text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-[#9090b8]">
              {isLogin ? "Enter your credentials to access your tasks" : "Sign up to start tracking your tasks"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090b8]" />
                  <input {...register("name")} type="text" placeholder="Full Name"
                    className={`${inputCls} ${inputFocusStyle}`} style={{ ...inputStyle, ...(errors.name ? { borderColor: "#ff3b55" } : {}) }} />
                </div>
                {errors.name && <span className="text-xs flex items-center gap-1 mt-1" style={{ color: "#ff3b55" }}><AlertTriangle className="w-3 h-3" />{errors.name.message as string}</span>}
              </div>
            )}
            
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090b8]" />
                <input {...register("email")} type="email" placeholder="Email Address"
                  className={`${inputCls} ${inputFocusStyle}`} style={{ ...inputStyle, ...(errors.email ? { borderColor: "#ff3b55" } : {}) }} />
              </div>
              {errors.email && <span className="text-xs flex items-center gap-1 mt-1" style={{ color: "#ff3b55" }}><AlertTriangle className="w-3 h-3" />{errors.email.message as string}</span>}
            </div>
            
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090b8]" />
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Password"
                  className={`${inputCls} ${inputFocusStyle} pr-12`} style={{ ...inputStyle, ...(errors.password ? { borderColor: "#ff3b55" } : {}) }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9090b8] hover:text-white transition-colors focus:outline-none">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <span className="text-xs flex items-center gap-1 mt-1" style={{ color: "#ff3b55" }}><AlertTriangle className="w-3 h-3" />{errors.password.message as string}</span>}
            </div>

            <button type="submit" disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ff2d78, #2d6aff)", boxShadow: "0 0 30px rgba(255,45,120,0.3)" }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>{isLogin ? "Sign In" : "Sign Up"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={toggleMode} className="text-sm text-[#9090b8] hover:text-white transition-colors">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className={gradText}>{isLogin ? "Sign up" : "Sign in"}</span>
            </button>
          </div>
          <div className="mt-4 text-center">
             <button onClick={() => setPage("landing")} className="text-xs text-[#9090b8] hover:text-[#ff2d78] transition-colors underline">
              Back to home
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
