"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  FolderKanban,
  Loader2,
  ArrowRight,
  X,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { createProject, getProjects } from "@/actions/project";
import { toast } from "sonner";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";

export default function ProjectsPage() {
  const { workspaceId } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectLoading, setNewProjectLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    const data = await getProjects(workspaceId);
    setProjects(data);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewProjectLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("workspaceId", workspaceId || "");

    const result = await createProject(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Project created successfully!");
      setIsAdding(false);
      fetchProjects();
    }
    setNewProjectLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Projects
          </h1>
          <p className="text-neutral-500 text-sm italic">
            Manage and track your team's stellar initiatives.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Add Project Form (Pro-look card) */}
      {isAdding && (
        <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="p-8 rounded-[2rem] border border-white/5 bg-neutral-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-600/10 blur-[60px] rounded-full" />

            <div className="flex justify-between items-center mb-6 relative">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Launch New Project
              </h2>
              <button
                onClick={() => setIsAdding(false)}
                className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                    Project Name
                  </label>
                  <input
                    name="name"
                    required
                    minLength={3}
                    placeholder="Enter project name..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                    Description (Optional)
                  </label>
                  <input
                    name="description"
                    placeholder="Short summary of the mission..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={newProjectLoading}
                  className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {newProjectLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Initiate Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-24 text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
          Synchronizing with central command...
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="p-6 rounded-3xl border border-white/5 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-white/10 transition-all group relative overflow-hidden block"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 blur-[30px] rounded-full group-hover:bg-indigo-500/10 transition-all" />

              <div className="w-12 h-12 bg-neutral-950 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-[0.05em]">
                {project.name}
              </h3>
              <p className="text-neutral-500 text-sm line-clamp-2 min-h-[40px] mb-6">
                {project.description ||
                  "No mission brief provided for this project."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-neutral-900/10">
            <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <FolderKanban className="w-10 h-10 text-neutral-700" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 italic">
              Your universe is empty
            </h2>
            <p className="text-neutral-500 text-sm max-w-[280px] text-center mb-8">
              Create your first project to organize your team's initiatives.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1 group"
            >
              Launch first project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )
      )}
    </div>
  );
}
