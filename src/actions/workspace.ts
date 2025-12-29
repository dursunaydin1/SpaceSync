"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "User not found" };

  const name = formData.get("name") as string;
  if (!name || name.length < 3) {
    return { error: "Name is required and must be at least 3 characters long" };
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { error } = await supabase.from("workspaces").insert({
    name,
    slug,
    owner_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Workspace with this name already exists" };
    }
    return { error: error.message };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function getWorkspace(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Get Workspace Error:", error.message);
    return null;
  }
  return data;
}

export async function updateWorkspace(id: string, name: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Login required" };

  // Sadece sahibi güncelleyebilir (Veya daha sonra role-based yetki eklenebilir)
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    return {
      error: "Permission denied. Only owners can change workspace settings.",
    };
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
