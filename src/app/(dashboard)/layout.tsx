import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name")
    .limit(1);

  const hasWorkspace = workspaces && workspaces.length > 0;
  const initialWorkspaceId = hasWorkspace ? workspaces[0].id : null;
  const initialWorkspaceName = hasWorkspace ? workspaces[0].name : null;

  return (
    <WorkspaceProvider
      initialWorkspaceId={initialWorkspaceId}
      initialWorkspaceName={initialWorkspaceName}
    >
      <div className="flex min-h-screen bg-neutral-950">
        {hasWorkspace && <Sidebar workspaceName={initialWorkspaceName!} />}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </WorkspaceProvider>
  );
}
