"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  MoreVertical,
  Loader2,
  ShieldCheck,
  User as UserIcon,
  Crown,
} from "lucide-react";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import {
  getWorkspaceMembers,
  inviteMember,
  removeMember,
} from "@/actions/member";
import { toast } from "sonner";

export default function MembersPage() {
  const { workspaceId } = useWorkspace();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    const data = await getWorkspaceMembers(workspaceId);
    setMembers(data);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !inviteEmail) return;

    setInviteLoading(true);
    const result = await inviteMember(workspaceId, inviteEmail, inviteRole);
    if (result.success) {
      toast.success("Member recruited to your fleet!");
      setInviteEmail("");
      fetchMembers();
    } else {
      toast.error(result.error);
    }
    setInviteLoading(false);
  };

  const handleRemove = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this member from the workspace?"
      )
    )
      return;

    const result = await removeMember(workspaceId!, userId);
    if (result.success) {
      toast.success("Member decommissioned.");
      fetchMembers();
    } else {
      toast.error("Process aborted: " + result.error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-neutral-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Identifying crew members...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            The Fellowship
          </h1>
          <p className="text-neutral-500 font-medium tracking-wide">
            MANAGE YOUR CREW AND OPERATIONAL ROLES
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 border border-white/5 px-4 py-2 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            {members.length} CREW MEMBERS LOGGED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recruitment Form (Invite) */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                Recruit New Crew
              </h3>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  Target Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="navigator@starfleet.org"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-neutral-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  Deployment Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all appearance-none text-neutral-300"
                >
                  <option value="member">Member (Operative)</option>
                  <option value="admin">Admin (Commander)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full bg-white text-black hover:bg-neutral-200 py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {inviteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                Send Authorization
              </button>
            </form>
          </div>
        </div>

        {/* Member List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center border-b border-white/5 pb-2 mb-6">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">
              Active Fleet Members
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-neutral-900/20 hover:bg-neutral-900/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                      {member.profiles?.avatar_url ? (
                        <img
                          src={member.profiles.avatar_url}
                          alt=""
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        <UserIcon className="w-6 h-6 text-neutral-500" />
                      )}
                    </div>
                    {member.role === "owner" && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-neutral-950">
                        <Crown className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {member.profiles?.full_name || "Ghost Operative"}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {member.profiles?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${
                      member.role === "owner"
                        ? "border-amber-500/20 text-amber-500 bg-amber-500/5"
                        : member.role === "admin"
                        ? "border-indigo-500/20 text-indigo-400 bg-indigo-500/5"
                        : "border-neutral-800 text-neutral-500 bg-neutral-800/10"
                    }`}
                  >
                    {member.role}
                  </div>

                  {member.role !== "owner" && (
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 text-neutral-600 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
