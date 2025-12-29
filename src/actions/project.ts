"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not logged in." };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const workspaceId = formData.get("workspaceId") as string;

  if (!name || name.length < 3) {
    return { error: "Project name must be at least 3 characters long." };
  }

  if (!workspaceId) {
    return { error: "Workspace ID is required." };
  }

  const { data: membership, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (memberError || !membership) {
    return { error: "You do not have permission to create a project." };
  }

  if (!["owner", "admin"].includes(membership.role)) {
    return { error: "Only owners and admins can create projects." };
  }

  const { error } = await supabase.from("projects").insert({
    name,
    description,
    workspace_id: workspaceId,
    owner_id: user.id,
  });

  if (error) {
    console.error("Project Create Error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/projects");
  return { success: true };
}

export async function getProjects(workspaceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get Projects Error:", error.message);
    return [];
  }

  return data;
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Get Project Error:", error.message);
    return null;
  }

  return data;
}

export async function updateProject(
  projectId: string,
  workspaceId: string,
  name: string,
  description: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Login required." };

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Permission denied." };
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath(`/projects/${data.slug}`);
  return { success: true, project: data };
}

export async function deleteProject(projectId: string, workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Login required." };

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "owner") {
    return { error: "Only workspace owners can delete projects." };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath("/projects");
  return { success: true };
}
