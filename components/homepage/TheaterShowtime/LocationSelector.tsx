"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoIosArrowDown } from "react-icons/io";

const provinces = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Vũng Tàu",
  "Bắc Giang",
  "Bắc Ninh",
  "Bình Dương",
  "Bình Định",
  "Bình Thuận",
  "Cà Mau",
  "Đắk Lắk",
  "Đồng Nai",
  "Khánh Hòa",
  "Lâm Đồng",
  "Nam Định",
  "Nghệ An",
  "Phú Thọ",
  "Quảng Nam",
  "Quảng Ninh",
  "Sóc Trăng",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Vĩnh Phúc",
  // ... (bạn có thể thêm hết 63 tỉnh thành ở đây)
];

type LocationSelectorProps = {
  location: string;
  setTheaterLocation: Dispatch<SetStateAction<string>>;
};

export default function LocationSelector({
  location,
  setTheaterLocation,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProvinces = provinces.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-sm w-52 flex items-center justify-around hover:bg-primary-dull gap-2 transition-all duration-300 rounded-md font-medium cursor-pointer overflow-hidden">
          <IoLocationOutline />
          {location}
          <IoIosArrowDown />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-2xl">
        <DialogHeader>
          <DialogTitle>Chọn địa điểm</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Input
            placeholder="Tìm kiếm tỉnh/thành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
          {filteredProvinces.map((province) => (
            <div
              key={province}
              onClick={() => {
                setTheaterLocation(province);
                setOpen(false);
              }}
              className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${location === province ? "bg-[#f84565]" : "hover:bg-zinc-800"}`}
            >
              {province}
            </div>
          ))}

          {filteredProvinces.length === 0 && (
            <p className="text-sm text-zinc-500 text-center mt-4">
              Không tìm thấy tỉnh phù hợp
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
