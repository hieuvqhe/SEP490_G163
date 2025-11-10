"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input"; // nếu bạn đang dùng shadcn/ui
import { cn } from "@/lib/utils"; // dùng để merge class nếu bạn có utils này
import { SearchIcon } from "lucide-react";

interface Theater {
  id: number;
  name: string;
  logo: string;
}

const theaters: Theater[] = [
  // --- CGV ---
  {
    id: 1,
    name: "CGV Hồ Gươm Plaza",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/CGV_logo.svg",
  },
  {
    id: 2,
    name: "CGV Vincom Bà Triệu",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/CGV_logo.svg",
  },
  {
    id: 3,
    name: "CGV Aeon Mall Hà Đông",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/CGV_logo.svg",
  },

  // --- Lotte Cinema ---
  {
    id: 4,
    name: "Lotte Cinema Landmark 81",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Lotte_Cinema_logo.svg",
  },
  {
    id: 5,
    name: "Lotte Cinema Thủ Đức",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Lotte_Cinema_logo.svg",
  },
  {
    id: 6,
    name: "Lotte Cinema Gò Vấp",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Lotte_Cinema_logo.svg",
  },

  // --- Galaxy ---
  {
    id: 7,
    name: "Galaxy Nguyễn Du",
    logo: "https://upload.wikimedia.org/wikipedia/vi/0/05/Galaxy_Cinema_logo.png",
  },
  {
    id: 8,
    name: "Galaxy Tân Bình",
    logo: "https://upload.wikimedia.org/wikipedia/vi/0/05/Galaxy_Cinema_logo.png",
  },
  {
    id: 9,
    name: "Galaxy Kinh Dương Vương",
    logo: "https://upload.wikimedia.org/wikipedia/vi/0/05/Galaxy_Cinema_logo.png",
  },

  // --- BHD Star ---
  {
    id: 10,
    name: "BHD Star Bitexco",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/BHD_Star_Cineplex_logo.png",
  },
  {
    id: 11,
    name: "BHD Star Vincom Lê Văn Việt",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/BHD_Star_Cineplex_logo.png",
  },

  // --- Cinestar ---
  {
    id: 12,
    name: "Cinestar Hai Bà Trưng",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Cinestar_logo.png",
  },
  {
    id: 13,
    name: "Cinestar Quốc Thanh",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Cinestar_logo.png",
  },

  // --- MegaGS ---
  {
    id: 14,
    name: "MegaGS Cao Thắng",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/MegaGS_logo.png",
  },
  {
    id: 15,
    name: "MegaGS Bình Dương",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/MegaGS_logo.png",
  },
];


const TheaterByName = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredTheaters = theaters.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[40%] flex flex-col items-center gap-3 px-4">
      {/* Ô tìm kiếm */}
      <div className="relative flex items-center gap-2 w-full bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors duration-300">
        <input
          type="text"
          placeholder="Tìm kiếm rạp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none placeholder:text-gray-400 text-white w-32 md:w-48"
        />
        <SearchIcon className="w-5 h-5 text-gray-400 absolute right-3" />
      </div>

      {/* Danh sách rạp */}
      <div className="flex flex-col gap-3 w-full">
        {filteredTheaters.map((theater) => (
          <TheaterTab
            key={theater.id}
            isActive={selected === theater.id}
            name={theater.name}
            logo={theater.logo}
            onClick={() => setSelected(theater.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface TheaterTabProps {
  isActive: boolean;
  name: string;
  logo: string;
  onClick: () => void;
}

const TheaterTab = ({ isActive, name, logo, onClick }: TheaterTabProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full px-5 py-4 rounded-2xl flex items-center justify-start gap-4 cursor-pointer transition-all",
        isActive
          ? "bg-primary text-white shadow-md"
          : ""
      )}
    >
      <div className="w-10 h-10 relative">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain rounded-md"
        />
      </div>
      <h1 className="font-semibold text-lg">{name}</h1>
    </div>
  );
};

export default TheaterByName;
