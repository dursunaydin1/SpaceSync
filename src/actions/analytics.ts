"use server";

import { createClient } from "@/lib/supabase/server";

export async function getWorkspaceAnalytics(workspaceId: string) {
  const supabase = await createClient();

  // Fetch all tasks (Base data for statistics)
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("status, priority, created_at, projects(name)")
    .eq("workspace_id", workspaceId);

  if (tasksError) {
    console.error("Analytics Tasks Error:", tasksError.message);
    return null;
  }

  // Status Distribution
  const statusDistribution = [
    {
      name: "To Do",
      value: tasks.filter((t) => t.status === "todo").length,
      color: "#94a3b8",
    },
    {
      name: "In Progress",
      value: tasks.filter(
        (t) => t.status === "doing" || t.status === "in_progress"
      ).length,
      color: "#6366f1",
    },
    {
      name: "Done",
      value: tasks.filter((t) => t.status === "done").length,
      color: "#10b981",
    },
  ];

  // Priority Distribution
  const priorityDistribution = [
    {
      name: "Urgent",
      value: tasks.filter((t) => t.priority === "urgent").length,
      color: "#f87171",
    },
    {
      name: "High",
      value: tasks.filter((t) => t.priority === "high").length,
      color: "#fb923c",
    },
    {
      name: "Medium",
      value: tasks.filter((t) => t.priority === "medium").length,
      color: "#6366f1",
    },
    {
      name: "Low",
      value: tasks.filter((t) => t.priority === "low").length,
      color: "#94a3b8",
    },
  ];

  // Tasks per Project
  const projectStatsMap: Record<string, number> = {};
  tasks.forEach((t: any) => {
    const task = t as any;
    const projectName =
      task.projects?.name ||
      (Array.isArray(task.projects) ? task.projects[0]?.name : "Unknown");
    projectStatsMap[projectName] = (projectStatsMap[projectName] || 0) + 1;
  });

  const projectDistribution = Object.entries(projectStatsMap)
    .map(([name, count]) => ({
      name,
      tasks: count,
    }))
    .sort((a, b) => b.tasks - a.tasks);

  return {
    statusDistribution,
    priorityDistribution,
    projectDistribution,
    totalTasks: tasks.length,
    completionRate:
      tasks.length > 0
        ? Math.round(
            (tasks.filter((t) => t.status === "done").length / tasks.length) *
              100
          )
        : 0,
  };
}
