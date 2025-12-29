// Database Types for SpaceSync
// This file contains TypeScript types for Supabase tables

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  // Join fields
  profiles?: Profile;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  workspace_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  workspace_id: string;
  owner_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  projects?: Pick<Project, "name">;
  assigned_to_profile?: Pick<Profile, "full_name" | "avatar_url">;
}

// Form data tipileri
export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  workspaceId: string;
  priority?: TaskPriority;
  assignedTo?: string;
}

export interface UpdateTaskInput {
  title?: string;
  priority?: TaskPriority;
  assigned_to?: string | null;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  workspaceId: string;
}

// Analytics tipileri
export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface PriorityDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ProjectDistribution {
  name: string;
  tasks: number;
}

export interface WorkspaceAnalytics {
  statusDistribution: StatusDistribution[];
  priorityDistribution: PriorityDistribution[];
  projectDistribution: ProjectDistribution[];
  totalTasks: number;
  completionRate: number;
}
