"use client";

import React, { createContext, useContext, useState } from "react";

interface WorkspaceContextType {
  workspaceId: string | null;
  workspaceName: string | null;
  setWorkspace: (id: string, name: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({
  children,
  initialWorkspaceId,
  initialWorkspaceName,
}: {
  children: React.ReactNode;
  initialWorkspaceId: string | null;
  initialWorkspaceName: string | null;
}) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(
    initialWorkspaceId
  );
  const [workspaceName, setWorkspaceName] = useState<string | null>(
    initialWorkspaceName
  );

  const setWorkspace = (id: string, name: string) => {
    setWorkspaceId(id);
    setWorkspaceName(name);
  };

  return (
    <WorkspaceContext.Provider
      value={{ workspaceId, workspaceName, setWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
