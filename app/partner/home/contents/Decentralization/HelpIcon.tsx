import React from "react";
import { CircleHelp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HelpIconProps {
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function HelpIcon({
  title,
  description,
  side = "right",
  align = "center",
  className,
}: HelpIconProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-0.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CircleHelp className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-80 bg-zinc-800 border-zinc-700 text-zinc-100 shadow-xl"
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-orange-400">{title}</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
