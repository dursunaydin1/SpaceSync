"use client";

import React, { FormEvent, useState } from "react";
import { createWorkspace } from "@/actions/workspace";
import { toast } from "sonner";
import { Plus, Loader2, Sparkles, Building2 } from "lucide-react";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createWorkspace(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950">
      {/* Title */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/5">
          <Sparkles className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2 italic">
          Forge Your Universe
        </h1>
        <p className="text-neutral-500 text-sm max-w-[280px] mx-auto">
          Every great journey starts with a single workspace. What shall we call
          yours?
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-[400px] p-8 rounded-3xl border border-white/5 bg-neutral-900/40 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workspace Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
              Workspace Name
            </label>
            <div className="relative group">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                name="name"
                type="text"
                required
                minLength={3}
                placeholder="e.g. Acme Studio, Alpha Team"
                className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-700"
              />
            </div>
            <p className="text-[9px] text-neutral-600 pl-1">
              This will be used to generate your workspace URL.
            </p>
          </div>

          {/* Create Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Workspace
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-[9px] text-neutral-700 uppercase tracking-[0.4em] animate-in fade-in duration-1000 delay-500">
        &copy; 2025 SPACESYNC — COMMAND CENTER
      </footer>
    </div>
  );
}
