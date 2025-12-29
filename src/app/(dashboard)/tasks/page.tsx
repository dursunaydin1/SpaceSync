"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Loader2,
  ArrowRight,
  X,
  Clock,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  createTask,
  getAllWorkspaceTasks,
  updateTaskStatus,
} from "@/actions/task";
import { getProjects } from "@/actions/project";
import { toast } from "sonner";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { getWorkspaceMembers } from "@/actions/member";
import { User, Filter } from "lucide-react";

export default function TasksPage() {
  const { workspaceId } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskLoading, setNewTaskLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "mine">("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    // Get user ID for "My Tasks" filter
    const {
      data: { user },
    } = await import("@/lib/supabase/client").then((m) =>
      m.createClient().auth.getUser()
    );
    setUserId(user?.id || null);

    const [tasksData, projectsData, membersData] = await Promise.all([
      getAllWorkspaceTasks(workspaceId),
      getProjects(workspaceId),
      getWorkspaceMembers(workspaceId),
    ]);
    setTasks(tasksData);
    setProjects(projectsData);
    setMembers(membersData);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewTaskLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("workspaceId", workspaceId || "");

    const result = await createTask(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Task initiated into orbit!");
      setIsAdding(false);
      fetchData();
    }
    setNewTaskLoading(false);
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    const result = await updateTaskStatus(taskId, newStatus);
    if (result.success) {
      fetchData();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Tasks
          </h1>
          <p className="text-neutral-500 text-sm italic">
            Execute your mission objectives with precision.
          </p>
        </div>

        {!isAdding && projects.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-white/5 pb-4">
        <div className="flex bg-neutral-900 border border-white/5 rounded-xl p-1">
          <button
            onClick={() => setFilterType("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filterType === "all"
                ? "bg-neutral-800 text-white shadow-lg"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            All Objectives
          </button>
          <button
            onClick={() => setFilterType("mine")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filterType === "mine"
                ? "bg-neutral-800 text-white shadow-lg"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            My Mission
          </button>
        </div>

        <input
          placeholder="Search objectives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-neutral-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-full md:w-64"
        />
      </div>

      {/* Add Task Form (Pro UI) */}
      {isAdding && (
        <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
          <div className="p-8 rounded-[2rem] border border-white/5 bg-neutral-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[80px] rounded-full" />

            <div className="flex justify-between items-center mb-6 relative">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-500" />
                Define Mission Task
              </h2>
              <button
                onClick={() => setIsAdding(false)}
                className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                    Target Project
                  </label>
                  <select
                    name="projectId"
                    required
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    <option value="low">Low - Routine</option>
                    <option value="medium">Medium - Standard</option>
                    <option value="high">High - Priority</option>
                    <option value="urgent">Urgent - Critical</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                    Assignee
                  </label>
                  <select
                    name="assignedTo"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.profiles?.full_name || member.profiles?.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                    Task Objective
                  </label>
                  <input
                    name="title"
                    required
                    minLength={2}
                    placeholder="Clear and actionable objective..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={newTaskLoading}
                  className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {newTaskLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Deploy Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center py-24 text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
          Retrieving objective logs...
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-700">
          {tasks
            .filter((t) => {
              // 1. Filter by Type
              if (filterType === "mine" && t.assigned_to !== userId) {
                return false;
              }
              // 2. Filter by Search
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                  t.title.toLowerCase().includes(query) ||
                  t.projects?.name.toLowerCase().includes(query)
                );
              }
              return true;
            })
            .map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border border-white/5 bg-neutral-900/20 hover:bg-neutral-900/40 transition-all flex items-center gap-4 group ${
                  task.status === "done" ? "opacity-50" : ""
                }`}
              >
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.status === "done"
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-white/10 hover:border-indigo-500/50"
                  }`}
                >
                  {task.status === "done" && (
                    <CheckSquare className="w-4 h-4 text-white" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`text-sm font-semibold transition-all ${
                        task.status === "done"
                          ? "line-through text-neutral-500"
                          : "text-neutral-100"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.assigned_to_profile && (
                      <div
                        className="w-4 h-4 rounded-full border border-white/10 overflow-hidden bg-neutral-800 ml-2"
                        title={`Assigned to ${task.assigned_to_profile.full_name}`}
                      >
                        {task.assigned_to_profile.avatar_url ? (
                          <img
                            src={task.assigned_to_profile.avatar_url}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[6px] font-bold text-neutral-400">
                            {task.assigned_to_profile.full_name
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {task.projects?.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                        task.priority === "urgent"
                          ? "text-red-400"
                          : task.priority === "high"
                          ? "text-orange-400"
                          : "text-neutral-400"
                      }`}
                    >
                      {task.priority === "urgent" && (
                        <AlertCircle className="w-2.5 h-2.5" />
                      )}
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-neutral-600" />
                  {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      ) : (
        !isAdding && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-neutral-900/10">
            <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <CheckSquare className="w-10 h-10 text-neutral-700" />
            </div>
            {projects.length === 0 ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 italic">
                  Projects Required
                </h2>
                <p className="text-neutral-500 text-sm max-w-[280px] text-center mb-8">
                  You must have at least one project before defining task
                  objectives.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 italic">
                  Zero Objectives Found
                </h2>
                <p className="text-neutral-500 text-sm max-w-[280px] text-center mb-8">
                  Define your tasks to start tracking your mission progress.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1 group"
                >
                  Launch first objective
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
