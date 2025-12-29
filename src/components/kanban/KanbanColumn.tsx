"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import type { Task, WorkspaceMember } from "@/types/database";

interface KanbanColumnProps {
  id: string; // "todo", "in_progress", "done"
  title: string;
  tasks: Task[];
  members: WorkspaceMember[];
  onUpdate: () => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  members,
  onUpdate,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col flex-1 min-w-[300px] bg-neutral-900/20 rounded-2xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
          {title}
        </h3>
        <span className="text-[10px] font-bold bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[500px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              members={members}
              onUpdate={onUpdate}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
