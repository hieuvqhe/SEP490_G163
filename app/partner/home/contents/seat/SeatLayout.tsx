"use client";
import {
  PartnerSeatType,
  useGetPartnerSeatTypes,
} from "@/apis/partner.seat-type.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Seat } from "./Seat";

export interface SeatData {
  row: string;
  column: number;
  seatTypeId: number;
  status: "Available" | "Booked" | "Disabled";
  colorCode: string;
}

const SeatLayout = () => {
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [selectedSeatType, setSelectedSeatType] = useState<PartnerSeatType>();

  const { data: partnerSeatTypeRes, isLoading } = useGetPartnerSeatTypes();
  const partnerSeatTypes = partnerSeatTypeRes?.result.seatTypes;

  const handleGenSeat = (e: React.FormEvent) => {
    e.preventDefault();
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, rows);
    const newSeats: SeatData[] = [];

    rowLetters.forEach((row) => {
      for (let c = 1; c <= cols; c++) {
        newSeats.push({
          row,
          column: c,
          seatTypeId: selectedSeatType?.id || 0,
          status: "Available",
          colorCode: selectedSeatType?.color || "#FFFFFF",
        });
      }
    });

    setSeats(newSeats);
    setSelectedSeats([]);
  };

  const toggleSelect = (row: string, column: number) => {
    const seatId = `${row}${column}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const toggleRowSelect = (row: string) => {
    const rowSeats = seats.filter((s) => s.row === row);
    const rowIds = rowSeats.map((s) => `${s.row}${s.column}`);
    const allSelected = rowIds.every((id) => selectedSeats.includes(id));
    setSelectedSeats((prev) =>
      allSelected
        ? prev.filter((id) => !rowIds.includes(id))
        : [...prev, ...rowIds.filter((id) => !prev.includes(id))]
    );
  };

  const toggleColumnSelect = (column: number) => {
    const colSeats = seats.filter((s) => s.column === column);
    const colIds = colSeats.map((s) => `${s.row}${s.column}`);
    const allSelected = colIds.every((id) => selectedSeats.includes(id));
    setSelectedSeats((prev) =>
      allSelected
        ? prev.filter((id) => !colIds.includes(id))
        : [...prev, ...colIds.filter((id) => !prev.includes(id))]
    );
  };

  interface UpdateSeatParams {
    newStatus: "Available" | "Disabled";
    newColor: string;
    newTypeId: number;
  }

  const handleUpdateSelected = ({
    newStatus,
    newColor,
    newTypeId,
  }: UpdateSeatParams) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        selectedSeats.includes(`${seat.row}${seat.column}`)
          ? {
              ...seat,
              status: newStatus,
              colorCode: newColor,
              seatTypeId: newTypeId,
            }
          : seat
      )
    );
    setSelectedSeats([]);
  };

  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, rows);

  return (
    <div className="p-6 space-y-6">
      {/* Form tạo ghế */}
      <div className="flex justify-between [box-shadow:var(--shadow-m)] items-center w-3xl bg-zinc-800 px-4 py-6 rounded-lg shadow-md">
        <form onSubmit={handleGenSeat} className="flex gap-2 items-center">
          <div className="w-100 bg-zinc-900 p-6 rounded-lg shadow-md [box-shadow:var(--shadow-m)]">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="leading-none font-medium">Tạo sơ đồ ghế</h4>
                <p className="text-sm text-zinc-200/50">
                  Điều chỉnh các thông số bên dưới để tạo sơ đồ ghế
                </p>
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Loại ghế</Label>
                  <Select
                    onValueChange={(value) => {
                      const type = partnerSeatTypes?.find(
                        (t: PartnerSeatType) => t.color === value
                      );
                      setSelectedSeatType(type);
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-zinc-700">
                      <SelectValue placeholder="Chọn loại ghế" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-700">
                      <SelectGroup>
                        <SelectLabel>Các kiểu ghế</SelectLabel>
                        {partnerSeatTypes?.map((seatType) => (
                          <SelectItem key={seatType.id} value={seatType.color}>
                            {seatType.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="row">Số hàng</Label>
                  <Input
                    id="row"
                    defaultValue={5}
                    className="col-span-2 h-8"
                    type="number"
                    placeholder="Số hàng"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    min={1}
                    max={26}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="col">Số cột</Label>
                  <Input
                    id="col"
                    defaultValue={5}
                    className="col-span-2 h-8"
                    type="number"
                    placeholder="Số cột"
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <Button
                  type="submit"
                  // variant={"ghost"}
                  className="bg-zinc-200 text-zinc-900 px-4 py-1 rounded hover:bg-zinc-200/80 transition"
                >
                  Tạo ghế
                </Button>
              </div>
            </div>
          </div>
        </form>

        {selectedSeatType && (
          <div className="w-52 bg-zinc-900 p-6 rounded-lg shadow-md [box-shadow:var(--shadow-m)] transition-all duration-300 border border-zinc-800 hover:border-zinc-700">
            <div className="space-y-3">
              {/* Seat color preview */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-md border border-zinc-700"
                  style={{ backgroundColor: selectedSeatType.color }}
                />
                <div>
                  <p className="text-sm text-zinc-400">Màu ghế</p>
                  <p className="text-zinc-100 font-medium">
                    {selectedSeatType.color}
                  </p>
                </div>
              </div>

              {/* Seat info */}
              <div>
                <p className="text-sm text-zinc-400">Tên loại ghế</p>
                <p className="text-zinc-100 font-semibold">
                  {selectedSeatType.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {/* Khu vực Zoom + Pan */}
        <div className="flex flex-col [box-shadow:var(--shadow-m)] items-center justify-center w-3xl h-[80vh] mt-10 bg-zinc-800 rounded-lg shadow-inner overflow-hidden">
          <TransformWrapper
            minScale={0.5}
            maxScale={2.5}
            wheel={{ step: 0.5 }}
            doubleClick={{ disabled: true }}
            panning={{ velocityDisabled: true }}

            // centerOnInit = {true}
          >
            <TransformComponent>
              <div className="flex flex-col w-full items-center justify-center gap-5">
                <div className="flex flex-col justify-center items-center w-full">
                  <div className="border-gray-200 border-4 w-lg rounded-full"></div>
                  <p>Screen</p>
                </div>
                {seats.length > 0 && (
                  <div className="flex flex-col w-full h-full gap-2">
                    {/* Tiêu đề cột */}
                    <div
                      className="grid gap-3 ml-10"
                      style={{ gridTemplateColumns: `repeat(${cols}, 2.5rem)` }}
                    >
                      {Array.from({ length: cols }).map((_, i) => (
                        <div
                          key={i}
                          onClick={() => toggleColumnSelect(i + 1)}
                          className={`text-center font-semibold cursor-pointer ${
                            seats.some((s) =>
                              selectedSeats.includes(`${s.row}${i + 1}`)
                            )
                              ? "text-yellow-500"
                              : "text-gray-700"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Các hàng ghế */}
                    {rowLetters.map((rowLetter) => (
                      <div key={rowLetter} className="flex items-center gap-2">
                        <div
                          onClick={() => toggleRowSelect(rowLetter)}
                          className={`w-8 text-center font-bold cursor-pointer ${
                            seats.some((s) =>
                              selectedSeats.includes(`${rowLetter}${s.column}`)
                            )
                              ? "text-yellow-500"
                              : "text-gray-700"
                          }`}
                        >
                          {rowLetter}
                        </div>

                        <div
                          className="grid gap-3"
                          style={{
                            gridTemplateColumns: `repeat(${cols}, 2.5rem)`,
                          }}
                        >
                          {(() => {
                            const rowSeats = seats.filter(
                              (s) => s.row === rowLetter
                            );
                            let activeIndex = 0;

                            return rowSeats.map((seat) => {
                              const isDisabled = seat.status === "Disabled";
                              if (!isDisabled) activeIndex += 1;
                              

                              const label = isDisabled
                                ? "Z0"
                                : `${seat.row}${activeIndex}`;

                              

                              return (
                                <Seat
                                  key={`${seat.row}-${seat.column}`}
                                  data={seat}
                                  isSelected={selectedSeats.includes(
                                    `${seat.row}${seat.column}`
                                  )}
                                  onToggleSelect={() =>
                                    toggleSelect(seat.row, seat.column)
                                  }
                                  label={label}
                                  isPreview={isPreview}
                                />
                              );
                            });
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Khu vực thao tác với ghế */}
        <div className="w-xs h-[80vh] mt-10 bg-zinc-900 rounded-xl border border-zinc-700 shadow-xl flex flex-col overflow-hidden [box-shadow:var(--shadow-m)]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-700 bg-zinc-800/80 backdrop-blur-md">
            <h2 className="text-sm font-semibold text-zinc-100 tracking-wide uppercase">
              Thao tác ghế
            </h2>
            <span className="text-xs text-zinc-400">
              {selectedSeats.length > 0
                ? `${selectedSeats.length} ghế đã chọn`
                : "Chưa chọn ghế"}
            </span>
          </div>

          {/* Nội dung */}
          <div className="flex flex-col justify-between flex-1 p-5 overflow-y-auto">
            <div className="flex flex-col w-full gap-6">
              {/* --- Cập nhật trạng thái --- */}
              <div className="space-y-3">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
                  Cập nhật trạng thái
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() =>
                      handleUpdateSelected({
                        newStatus: "Available",
                        newColor: selectedSeatType
                          ? selectedSeatType.color
                          : "#FFFFFF",
                        newTypeId: selectedSeatType ? selectedSeatType.id : 0,
                      })
                    }
                    className=" w-full opacity-80 px-4 py-2 bg-zinc-700 rounded-md font-medium transition border text-sm flex items-center justify-center gap-2 "
                    style={
                      selectedSeatType
                        ? {
                            backgroundColor: selectedSeatType.color,
                            color: "#fff",
                          }
                        : {}
                    }
                    variant={"default"}
                  >
                    Mở
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateSelected({
                        newStatus: "Disabled",
                        newColor: "#808080",
                        newTypeId: 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-zinc-700 rounded-md font-medium transition border text-sm flex items-center justify-center gap-2 "
                    variant={"default"}
                  >
                    Vô hiệu
                  </Button>
                </div>
              </div>

              {/* --- Cập nhật loại ghế --- */}
              <div className="space-y-3">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide">
                  Cập nhật loại ghế
                </p>

                <Select
                  onValueChange={(value) => {
                    const type = partnerSeatTypes?.find(
                      (t: PartnerSeatType) => t.color === value
                    );
                    handleUpdateSelected({
                      newStatus: "Available",
                      newColor: type ? type.color : "#FFFFFF",
                      newTypeId: type ? type.id : 0,
                    });
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Chọn loại ghế" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 text-zinc-100 border-zinc-700">
                    <SelectGroup>
                      <SelectLabel>Các kiểu ghế</SelectLabel>
                      {partnerSeatTypes?.map((seatType) => (
                        <SelectItem key={seatType.id} value={seatType.color}>
                          {seatType.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* --- Nút xem trước --- */}
              <div className="pt-2 border-t border-zinc-700">
                <Button
                  onClick={() => setIsPreview((p) => !p)}
                  className={`w-full px-4 py-2 bg-zinc-700 rounded-md font-medium transition border text-sm flex items-center justify-center gap-2 `}
                  variant={"default"}
                >
                  {isPreview ? "Xem ghế bị ẩn" : "Ẩn ghế"}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer: Hoàn tất tạo sơ đồ */}
          <div className="p-4 border-t border-zinc-700 bg-zinc-800/90 backdrop-blur-sm">
            <button
              onClick={() => console.log(seats)}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-500 transition font-medium text-sm shadow-md"
            >
              Hoàn tất tạo sơ đồ ghế
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
