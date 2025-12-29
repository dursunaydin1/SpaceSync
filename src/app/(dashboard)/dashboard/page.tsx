import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Check user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch workspaces user is a member of (RLS ensures they only see their own)
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select(
      `
      *,
      workspace_members!inner (
        role
      )
    `
    )
    .limit(1); // For now, get only the first workspace (MVP)

  // 3. IF NO WORKSPACE -> REDIRECT TO SETUP PAGE
  if (!workspaces || workspaces.length === 0) {
    redirect("/setup");
  }

  const currentWorkspace = workspaces[0];
  const userRole = currentWorkspace.workspace_members[0].role;

  // 4. Fetch statistics (Real data)
  const [projectsCount, tasksCount, doneTasksCount] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", currentWorkspace.id),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", currentWorkspace.id),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", currentWorkspace.id)
      .eq("status", "done"),
  ]);

  const totalProjects = projectsCount.count || 0;
  const totalTasks = tasksCount.count || 0;
  const completedTasks = doneTasksCount.count || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              SpaceSync Dashboard
            </h1>
            <p className="text-neutral-500 text-sm">
              Exploring{" "}
              <span className="text-indigo-400 font-semibold">
                {currentWorkspace.name}
              </span>{" "}
              as <span className="text-neutral-300 capitalize">{userRole}</span>
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm group hover:border-indigo-500/20 transition-all">
            <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">
              Active Projects
            </h3>
            <p className="text-3xl font-bold text-white">{totalProjects}</p>
            <p className="text-[10px] text-neutral-600 mt-2 uppercase">
              Operational Units
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm group hover:border-indigo-500/20 transition-all">
            <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">
              Pending Tasks
            </h3>
            <p className="text-3xl font-bold text-white">
              {totalTasks - completedTasks}
            </p>
            <p className="text-[10px] text-neutral-600 mt-2 uppercase">
              Mission Objectives
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm group hover:border-indigo-500/20 transition-all">
            <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">
              Success Rate
            </h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-white">{completionRate}%</p>
              <div className="mb-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-neutral-600 mt-2 uppercase">
              Mission Completion
            </p>
          </div>
        </main>

        {/* Welcome Message / Quick Actions */}
        <div className="mt-12 p-12 text-center rounded-[2.5rem] border border-dashed border-white/10 bg-neutral-900/10">
          <h2 className="text-xl font-bold text-white mb-2 italic">
            Welcome to Control Center
          </h2>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">
            You are currently managing{" "}
            <span className="text-white">{totalProjects}</span> projects with{" "}
            <span className="text-white">{totalTasks}</span> total objectives.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="w-1 h-1 rounded-full bg-neutral-800" />
            <div className="w-1 h-1 rounded-full bg-neutral-800" />
            <div className="w-1 h-1 rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
