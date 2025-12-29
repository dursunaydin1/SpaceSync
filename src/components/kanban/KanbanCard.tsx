"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, UserPlus, Check, X } from "lucide-react";
import { updateTask } from "@/actions/task";
import { toast } from "sonner";
import type { Task, WorkspaceMember } from "@/types/database";

interface TaskCardProps {
  task: Task;
  members: WorkspaceMember[];
  onUpdate: () => void;
}

export function KanbanCard({ task, members, onUpdate }: TaskCardProps) {
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 p-4 rounded-xl border-2 border-dashed border-indigo-500/50 bg-indigo-500/5 min-h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 rounded-xl border border-white/5 bg-neutral-900/50 hover:bg-neutral-900 hover:border-white/10 transition-all group cursor-grab active:cursor-grabbing"
    >
      <h4 className="text-sm font-semibold text-neutral-200 mb-2 group-hover:text-white transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-4">
        <span
          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
            task.priority === "urgent"
              ? "bg-red-500/10 text-red-400"
              : task.priority === "high"
              ? "bg-orange-500/10 text-orange-400"
              : "bg-neutral-800 text-neutral-500"
          }`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-3 relative">
          {/* Assignee Display / Selector Toggle */}
          <div className="relative group/assignee">
            {task.assigned_to_profile ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAssigning(!isAssigning);
                }}
                className="w-5 h-5 rounded-full border border-white/10 overflow-hidden bg-neutral-800 hover:border-indigo-500 transition-colors"
                title={`Assigned to ${task.assigned_to_profile.full_name}. Click to reassign.`}
              >
                {task.assigned_to_profile.avatar_url ? (
                  <img
                    src={task.assigned_to_profile.avatar_url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-neutral-400">
                    {task.assigned_to_profile.full_name
                      ?.substring(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAssigning(!isAssigning);
                }}
                className="w-5 h-5 rounded-full border border-dashed border-white/10 flex items-center justify-center hover:border-indigo-500 hover:bg-neutral-800 transition-all"
                title="Assign member"
              >
                <UserPlus className="w-3 h-3 text-neutral-600 hover:text-indigo-400" />
              </button>
            )}

            {/* Assignment Dropdown Overlay */}
            {isAssigning && (
              <div
                className="absolute bottom-full left-0 mb-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1 border-b border-white/5 mb-1">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                    Assign Member
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto scrollbar-hide">
                  <button
                    onClick={async () => {
                      setIsAssigning(false);
                      setLoading(true);
                      await updateTask(task.id, { assigned_to: null });
                      onUpdate();
                      setLoading(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-neutral-400 hover:bg-white/5 flex items-center justify-between"
                  >
                    Unassigned
                    {!task.assigned_to && (
                      <Check className="w-3 h-3 text-indigo-400" />
                    )}
                  </button>
                  {members.map((member) => (
                    <button
                      key={member.user_id}
                      onClick={async () => {
                        setIsAssigning(false);
                        setLoading(true);
                        const res = await updateTask(task.id, {
                          assigned_to: member.user_id,
                        });
                        if (res.success) {
                          toast.success("Assignee updated");
                          onUpdate();
                        }
                        setLoading(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-white hover:bg-indigo-600 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">
                        {member.profiles?.full_name || member.profiles?.email}
                      </span>
                      {task.assigned_to === member.user_id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-neutral-600">
            <Clock className="w-3 h-3" />
            {new Date(task.created_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
