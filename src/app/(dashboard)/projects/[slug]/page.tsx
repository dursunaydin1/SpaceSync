"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Loader2,
  Clock,
  AlertCircle,
  LayoutGrid,
  X,
  Settings,
  Trash2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import {
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "@/actions/project";
import { getTasks, createTask, updateTaskStatus } from "@/actions/task";
import { toast } from "sonner";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { getWorkspaceMembers } from "@/actions/member";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { workspaceId } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskLoading, setNewTaskLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const projectData = await getProjectBySlug(slug);

    if (projectData) {
      const [tasksData, membersData] = await Promise.all([
        getTasks(projectData.id),
        getWorkspaceMembers(workspaceId!),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);
    }

    setLoading(false);
  }, [slug, workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const result = await updateProject(
      project.id,
      workspaceId!,
      name,
      description
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project updated!");
      setIsEditing(false);
      fetchData();
    }
    setUpdateLoading(false);
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;

    const result = await deleteProject(project.id, workspaceId!);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted.");
      router.push("/projects");
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    let newStatus = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Check if dropped on a card (over.id is not a column ID)
    const validColumns = ["todo", "in_progress", "done"];
    if (!validColumns.includes(newStatus)) {
      const overTask = tasks.find((t) => t.id === newStatus);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        // Dropped on something invalid (neither column nor task)
        return;
      }
    }

    // If already in the same column, do nothing
    if (task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const result = await updateTaskStatus(taskId, newStatus);
    if (result.error) {
      toast.error("Status synchronization failed.");
      fetchData(); // Refetch data on error
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewTaskLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("workspaceId", workspaceId || "");
    formData.append("projectId", project.id);

    const result = await createTask(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Objective deployed!");
      setIsAddingTask(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Synchronizing mission data...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Signal Lost</h1>
        <p className="text-neutral-500 mt-2">
          The project could not be located in this sector.
        </p>
        <Link
          href="/projects"
          className="mt-8 text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-700">
      {/* Navigation */}
      <Link
        href="/projects"
        className="text-neutral-500 hover:text-white flex items-center gap-2 mb-12 transition-colors text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
        <div className="flex-1 w-full">
          {isEditing ? (
            <form
              onSubmit={handleUpdateProject}
              className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <input
                name="name"
                defaultValue={project.name}
                required
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:border-indigo-500 outline-none"
              />
              <textarea
                name="description"
                defaultValue={project.description}
                rows={3}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-neutral-400 focus:border-indigo-500 outline-none resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  {updateLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    {project.name}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
                {project.description ||
                  "No mission description provided for this initiative."}
              </p>
            </>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Objective
          </button>
        )}
      </div>

      {/* Task List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
            Mission Objectives
          </h2>
          <span className="text-[10px] font-bold bg-neutral-900 border border-white/5 px-3 py-1 rounded-full text-indigo-400 uppercase">
            {tasks.length} LOGGED
          </span>
        </div>

        {/* Rapid Task Addition Bar */}
        {isAddingTask && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <form
              onSubmit={handleCreateTask}
              className="flex gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-sm"
            >
              <input
                name="title"
                required
                autoFocus
                placeholder="Target objective..."
                className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm placeholder:text-neutral-700"
              />
              <select
                name="priority"
                className="bg-neutral-950 border border-white/5 rounded-lg px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                name="assignedTo"
                className="bg-neutral-950 border border-white/5 rounded-lg px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 outline-none max-w-[120px]"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.profiles?.full_name || member.profiles?.email}
                  </option>
                ))}
              </select>
              <button
                disabled={newTaskLoading}
                className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                {newTaskLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </form>
          </div>
        )}

        {tasks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide min-h-[600px]">
              <KanbanColumn
                id="todo"
                title="To Do"
                tasks={tasks.filter(
                  (t) =>
                    t.status === "todo" ||
                    !["in_progress", "doing", "done"].includes(t.status)
                )}
                members={members}
                onUpdate={fetchData}
              />
              <KanbanColumn
                id="in_progress"
                title="In Progress"
                tasks={tasks.filter(
                  (t) => t.status === "in_progress" || t.status === "doing"
                )}
                members={members}
                onUpdate={fetchData}
              />
              <KanbanColumn
                id="done"
                title="Done"
                tasks={tasks.filter((t) => t.status === "done")}
                members={members}
                onUpdate={fetchData}
              />
            </div>

            <DragOverlay>
              {activeTask ? (
                <KanbanCard
                  task={activeTask}
                  members={[]}
                  onUpdate={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          !isAddingTask && (
            <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
              <CheckSquare className="w-12 h-12 text-neutral-800 mb-4" />
              <p className="text-neutral-500 text-sm italic">
                No objectives assigned to this sector yet.
              </p>
              <button
                onClick={() => setIsAddingTask(true)}
                className="mt-6 text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-widest"
              >
                Initialize Objectives
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
