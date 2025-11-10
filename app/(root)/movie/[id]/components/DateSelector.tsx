"use client";

import React, { useMemo, useState, Dispatch, SetStateAction } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

interface DateSelectorProps {
  setDate: Dispatch<SetStateAction<string>>;
}

const DateSelector = ({ setDate }: DateSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().add(i, "day");
      return {
        id: i,
        full: date,
        dayName: date.format("dddd"), // "Thứ tư"
        dayNum: date.date(), // 25
      };
    });
  }, []);

  const handleSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setDate(dateStr); // ✅ Gọi setDate ở parent (truyền Date)
  };

  return (
    <div className="w-full">
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-3">
          {weekDays.map((day) => {
            const formatted = day.full.format("YYYY-MM-DD");
            const isSelected = selectedDate === formatted;
            const isToday = day.full.isSame(dayjs(), "day");

            return (
              <CarouselItem
                key={day.id}
                className="pl-3 basis-[100px] sm:basis-[110px] md:basis-[120px]"
              >
                <button
                  onClick={() => handleSelect(formatted)}
                  className={cn(
                    "relative w-full h-full flex flex-col items-center justify-center rounded-2xl px-4 py-5 transition-all duration-300 ease-out min-w-[90px]",
                    "active:scale-95",
                    isSelected
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-card hover:bg-muted/50 border border-border/50",
                    isToday && !isSelected && ""
                  )}
                >
                  {isToday && !isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider whitespace-nowrap",
                      isSelected
                        ? "text-primary-foreground/90"
                        : "text-muted-foreground"
                    )}
                  >
                    {day.dayName}
                  </span>

                  <span
                    className={cn(
                      "text-2xl font-bold mt-2",
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {day.dayNum}
                  </span>

                  {isSelected && (
                    <div className="absolute bottom-2 w-8 h-1 bg-primary-foreground/30 rounded-full" />
                  )}
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default DateSelector;
