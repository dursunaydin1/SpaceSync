"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { signUp } from "@/actions/auth";
import { toast } from "sonner"; // Toast notification

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const result = await signUp(formData);

    if (result?.error) {
      toast.error(result.error); // alert yerine şık bir toast mesajı
      setLoading(false);
    }

    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-center items-center p-6 selection:bg-white/10">
      <div className="mb-8 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tighter mb-2 italic">
          SpaceSync
        </h1>
        <p className="text-neutral-500 text-sm">Create your new workspace</p>
      </div>

      <div className="w-full max-w-[400px] p-8 rounded-2xl border border-white/5 bg-neutral-900/40 backdrop-blur-md shadow-2xl">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
              Full Name
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
              Work Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-indigo-500/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-neutral-500">Already have one?</span>{" "}
          <Link
            href="/login"
            className="text-white hover:underline underline-offset-4 transition-all font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>

      <footer className="mt-12 text-[9px] text-neutral-500 uppercase tracking-[0.3em]">
        &copy; 2025 SPACESYNC — SECURE ACCESS
      </footer>
    </div>
  );
}
