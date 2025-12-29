"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  UpdateTaskInput,
} from "@/types/database";

// Valid status values for validation
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "doing", "done"];
const VALID_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not logged in." };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const projectId = formData.get("projectId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const priority = (formData.get("priority") as string) || "medium";
  const assignedTo = formData.get("assignedTo") as string;

  if (!title || title.length < 2) {
    return { error: "Task title must be at least 2 characters long." };
  }

  if (!projectId || !workspaceId) {
    return { error: "Project and Workspace information is missing." };
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Only owners and admins can create tasks." };
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    project_id: projectId,
    workspace_id: workspaceId,
    priority,
    owner_id: user.id,
    assigned_to: assignedTo || null,
    status: "todo",
  });

  if (error) {
    console.error("Task Create Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const supabase = await createClient();

  // Input validation
  if (!VALID_STATUSES.includes(newStatus as TaskStatus)) {
    return { error: "Invalid status value." };
  }

  // Authorization check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  // Verify user has access to this task's workspace
  const { data: task } = await supabase
    .from("tasks")
    .select("workspace_id")
    .eq("id", taskId)
    .single();

  if (!task) return { error: "Task not found." };

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", task.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "Access denied." };

  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    console.error("Task Update Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTask(
  taskId: string,
  data: { title?: string; priority?: string; assigned_to?: string | null }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    console.error("Task Update Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/tasks");
  return { success: true };
}

export async function getTasks(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      assigned_to_profile:profiles!assigned_to (
        full_name,
        avatar_url
      )
    `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get Tasks Error:", error.message);
    return [];
  }

  return data;
}

export async function getAllWorkspaceTasks(workspaceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      projects (
        name
      ),
      assigned_to_profile:profiles!assigned_to (
        full_name,
        avatar_url
      )
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get All Tasks Error:", error.message);
    return [];
  }

  return data;
}
