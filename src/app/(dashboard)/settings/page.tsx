"use client";

import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Trash2,
  Save,
  Loader2,
  Monitor,
  Bell,
} from "lucide-react";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { getWorkspace, updateWorkspace } from "@/actions/workspace";
import { toast } from "sonner";

export default function SettingsPage() {
  const { workspaceId, workspaceName } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    async function fetchWorkspace() {
      if (!workspaceId) return;
      setLoading(true);
      const data = await getWorkspace(workspaceId);
      if (data) {
        setWorkspace(data);
        setNewName(data.name);
      }
      setLoading(false);
    }
    fetchWorkspace();
  }, [workspaceId]);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || newName.length < 3) return;

    setUpdateLoading(true);
    const result = await updateWorkspace(workspaceId, newName);
    if (result.success) {
      toast.success("Workspace updated successfully");
      window.location.reload(); // Re-fetch entire layout context
    } else {
      toast.error(result.error);
    }
    setUpdateLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Accessing system configuration...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-500" />
          Settings
        </h1>
        <p className="text-neutral-500 font-medium tracking-wide">
          MANAGE YOUR WORKSPACE AND PROFILE CONFIGURATION
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <SettingsNavButton active icon={<Monitor />} label="Workspace" />
          <SettingsNavButton icon={<User />} label="Profile" />
          <SettingsNavButton icon={<Bell />} label="Notifications" />
          <SettingsNavButton icon={<Shield />} label="Security" />
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-12">
          {/* Workspace Settings Section */}
          <section className="space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">
                Workspace Identity
              </h3>
              <p className="text-sm text-neutral-500">
                Configure how your command center appears to the team.
              </p>
            </div>

            <form onSubmit={handleUpdateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Workspace Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter workspace name"
                />
              </div>

              <div className="space-y-2 opacity-50">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Workspace Slug
                </label>
                <div className="w-full bg-neutral-900/50 border border-white/5 rounded-xl px-4 py-3 text-neutral-500 italic">
                  spacesync.app/w/{workspace?.slug}
                </div>
                <p className="text-[9px] text-neutral-700 uppercase italic font-bold">
                  SLUG IS PERMANENT FOR SECURITY PROTOCOLS
                </p>
              </div>

              <button
                disabled={updateLoading || newName === workspace?.name}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="space-y-6 pt-12">
            <div className="border-b border-red-500/10 pb-4">
              <h3 className="text-lg font-bold text-red-500">Danger Zone</h3>
              <p className="text-sm text-neutral-500">
                Irreversible actions that affect your entire fleet.
              </p>
            </div>

            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Decommission Workspace
                </h4>
                <p className="text-xs text-neutral-500">
                  All projects, tasks, and data will be permanently erased.
                </p>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsNavButton({ icon, label, active }: any) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
          : "text-neutral-500 hover:text-white hover:bg-neutral-900/50"
      }`}
    >
      {React.cloneElement(icon, { className: "w-4 h-4" })}
      {label}
    </button>
  );
}
