"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X } from "lucide-react";
import Image from "next/image";

interface SelectedActorsPopoverProps {
  selectedActors: {
    id: number;
    name: string;
    profileImage?: string | null;
  }[];
  onRemove: (id: number) => void;
}

export function SelectedActorsPopover({
  selectedActors,
  onRemove,
}: SelectedActorsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-zinc-400 text-sm hover:text-zinc-100 transition">
          {selectedActors.length} diễn viên đã chọn
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        className="w-80 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg"
      >
        <h4 className="text-sm font-medium text-zinc-200 mb-2">
          Danh sách đã chọn
        </h4>

        {selectedActors.length === 0 ? (
          <p className="text-zinc-500 text-sm">Chưa có diễn viên nào.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {selectedActors.map((actor) => (
              <div
                key={actor.id}
                className="flex items-center gap-3 p-2 rounded-md bg-zinc-800/60 hover:bg-zinc-700/40 transition"
              >
                <div className="w-10 h-14 overflow-hidden rounded-md flex-shrink-0">
                  <Image
                    src={
                      actor.profileImage ??
                      "https://via.placeholder.com/100x150?text=No+Image"
                    }
                    alt={actor.name}
                    width={100}
                    height={150}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <p className="flex-1 text-sm text-zinc-100 truncate">
                  {actor.name}
                </p>
                <button
                  onClick={() => onRemove(actor.id)}
                  className="text-zinc-400 hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
