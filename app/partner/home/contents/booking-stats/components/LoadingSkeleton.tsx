import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-zinc-800/80 border border-zinc-700 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-zinc-700 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-zinc-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
