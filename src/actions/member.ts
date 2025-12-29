"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetches all members in a workspace.
 */
export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      user_id,
      role,
      created_at,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Get Members Error:", error.message);
    return [];
  }

  return data;
}

/**
 * Invites/adds a new member to the workspace.
 * (Note: In a production system, this would first add to an 'invites' table and send an email.
 * Here we directly add as MVP.)
 */
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: string = "member"
) {
  const supabase = await createClient();

  // 1. First check if a profile with this email exists
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (profileError || !profile) {
    return {
      error: "User with this email not found. They must register first.",
    };
  }

  // 2. Check if already a member
  const { data: existingMember } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", profile.id)
    .single();

  if (existingMember) {
    return { error: "User is already a member of this workspace." };
  }

  // 3. Add to workspace
  const { error: insertError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role: role,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath("/members");
  return { success: true };
}

/**
 * Removes a member from the workspace.
 */
export async function removeMember(workspaceId: string, userId: string) {
  const supabase = await createClient();

  // Role check (Only owner/admin can remove - RLS should handle this but double-checking is good)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Auth required" };

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/members");
  return { success: true };
}
