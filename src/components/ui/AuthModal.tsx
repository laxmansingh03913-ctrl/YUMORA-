"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  PenTool,
  ShieldCheck,
  Check,
  Mail,
  Lock,
  User,
  AtSign,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    intendedDestination,
    closeAuthModal,
    openAuthModal,
    loginAsDemo,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    role,
    isLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("CREATOR");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalTab === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLogin) {
      const res = await signInWithEmail(email, password);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid email or password. Please check your credentials.");
      }
    } else {
      if (!name.trim()) {
        setErrorMessage("Please enter your display name.");
        return;
      }
      if (!username.trim() || username.length < 3) {
        setErrorMessage("Username must be at least 3 characters long.");
        return;
      }
      const res = await signUpWithEmail(email, password, name, username, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || "Sign up failed. Please try again.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-[480px] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 relative my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-rose-500/25">
              Y
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Yomika
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-6 sm:px-8 py-4 relative z-10 overflow-y-auto space-y-5 flex-1">
          {/* Intended Destination Context Banner */}
          {intendedDestination && (
            <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Compass className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span>
                {isLogin ? "Sign in" : "Create an account"} to continue to your reading destination.
              </span>
            </div>
          )}

          {/* Top Tab Toggle: Create Account vs Sign In */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                openAuthModal("signup");
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                !isLogin
                  ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-600/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openAuthModal("login");
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                isLogin
                  ? "bg-zinc-800 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isLogin ? "Welcome back to Yomika" : "Create your Yomika account"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {isLogin
                ? "Sign in to your account to continue your journey."
                : "Join readers and creators from around the world."}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Social OAuth Buttons (Google & Apple) */}
          <div className="space-y-2.5">
            {/* Google */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => signInWithOAuth("google")}
              className="w-full h-12 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => signInWithOAuth("apple")}
              className="w-full h-12 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.67-2.81 1.46-.59.68-1.11 1.83-.97 2.93 1.11.09 2.14-.56 2.79-1.35z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Clear Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px bg-zinc-800 flex-1" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">OR</span>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Display Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Carter"
                        className="w-full h-12 pl-10 pr-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 text-xs sm:text-sm transition"
                      />
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="alexwrites"
                        className="w-full h-12 pl-10 pr-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 text-xs sm:text-sm transition"
                      />
                      <AtSign className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
                    </div>
                  </div>
                </div>

                {/* Account Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    I want to:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("CREATOR")}
                      className={`h-11 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        selectedRole === "CREATOR"
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Write & Publish</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("READER")}
                      className={`h-11 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        selectedRole === "READER"
                          ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read & Discover</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-10 pr-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 text-xs sm:text-sm transition"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
              </div>
            </div>

            {/* Password with Visibility Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-11 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 text-xs sm:text-sm transition"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 absolute right-2.5 top-2.5 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                openAuthModal(isLogin ? "signup" : "login");
                setErrorMessage(null);
              }}
              className="text-xs text-zinc-400 hover:text-white transition font-medium"
            >
              {isLogin ? (
                <span>
                  Don&apos;t have an account?{" "}
                  <strong className="text-rose-400 hover:underline">Sign up</strong>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <strong className="text-indigo-400 hover:underline">Sign in</strong>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Terms */}
        <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/80 text-center text-[10px] text-zinc-500 leading-relaxed">
          By continuing, you agree to Yomika&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
