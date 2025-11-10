"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

type Theater = {
  id: string;
  name: string;
  logo: string;
  location: string;
};

type TheaterSelectorProps = {
  location: string;
  theaters?: Theater[];
  onSelect?: (theater: Theater) => void;
};

const dummyTheaters: Theater[] = [
  {
    id: "all",
    name: "All",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/CGV_logo.svg",
    location: "Hà Nội",
  },
  {
    id: "cgv",
    name: "CGV",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/CGV_logo.svg",
    location: "Hà Nội",
  },
  {
    id: "bhd",
    name: "BHD Star",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/BHD_Star_Cineplex_logo.svg",
    location: "Hà Nội",
  },
  {
    id: "lotte",
    name: "Lotte Cinema",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Lotte_Cinema_logo.svg",
    location: "Hà Nội",
  },
  {
    id: "galaxy",
    name: "Galaxy Cinema",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Galaxy_Cinema_logo.svg",
    location: "Hà Nội",
  },
];

export default function TheaterSelector({
  location,
  theaters = dummyTheaters,
  onSelect,
}: TheaterSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>("all");

  const filtered = theaters.filter((t) => t.location === location);

  return (
    <div className="px-3">
      <div className="flex flex-wrap items-center gap-4">
        {filtered.map((theater) => (
          <div
            key={theater.id}
            onClick={() => {
              setSelectedId(theater.id);
              onSelect?.(theater);
            }}
            className={clsx(
              "w-20 h-20 flex items-center justify-center rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-900 hover:bg-zinc-800",
              selectedId === theater.id
                ? "border-[#f84565] shadow-md"
                : "border-transparent"
            )}
          >
            <Image
              src={theater.logo}
              alt={theater.name}
              width={64}
              height={64}
              className="object-contain p-2"
            />
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-zinc-500 italic">
            Không có rạp nào tại khu vực này.
          </p>
        )}
      </div>
    </div>
  );
}
