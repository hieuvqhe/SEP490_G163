"use client";
import React, { useState } from "react";

interface SeatData {
  row: string;
  column: number;
  seatTypeId: number;
  status: "Available" | "Booked" | "Disabled";
}

const Seat: React.FC<{
  data: SeatData;
  isSelected: boolean;
  onToggleSelect: () => void;
}> = ({ data, isSelected, onToggleSelect }) => {
  const { row, column, status } = data;

  let color = "";
  if (status === "Disabled") color = "bg-transparent";
  else if (isSelected)
    color = "bg-yellow-500 hover:bg-yellow-600 cursor-pointer";
  else if (status === "Available")
    color = "bg-green-500 hover:bg-green-600 cursor-pointer";
  else if (status === "Booked") color = "bg-red-500 cursor-pointer";

  return (
    <div
      onClick={() => status !== "Disabled" && onToggleSelect()}
      className={`w-10 h-10 ${color} rounded-md flex items-center justify-center font-semibold text-white transition`}
    >
      {status === "Disabled" ? "" : `${row}${column}`}
    </div>
  );
};

const Page = () => {
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleGenSeat = (e: React.FormEvent) => {
    e.preventDefault();

    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, rows);
    const newSeats: SeatData[] = [];

    rowLetters.forEach((row) => {
      for (let c = 1; c <= cols; c++) {
        newSeats.push({
          row,
          column: c,
          seatTypeId: 1,
          status: "Available",
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

  // 🟢 Chọn cả hàng
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

  // 🔵 Chọn cả cột
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

  const handleUpdateSelected = (newStatus: SeatData["status"]) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        selectedSeats.includes(`${seat.row}${seat.column}`)
          ? { ...seat, status: newStatus }
          : seat
      )
    );
    setSelectedSeats([]);
  };

  // ✅ Lấy danh sách hàng (A–E) & cột (1–n)
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, rows);

  return (
    <div className="p-6 space-y-6 mt-20">
      {/* Form nhập số hàng/cột */}
      <div className="flex justify-between items-center">
        <form onSubmit={handleGenSeat} className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Nhập số hàng"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="border rounded px-2 py-1 w-32"
            min={1}
            max={26}
          />
          <input
            type="number"
            placeholder="Nhập số cột"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="border rounded px-2 py-1 w-32"
            min={1}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Tạo ghế
          </button>
        </form>

        {/* Nút cập nhật trạng thái */}
        {selectedSeats.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateSelected("Booked")}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Đặt chỗ
            </button>
            <button
              onClick={() => handleUpdateSelected("Available")}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Mở lại
            </button>
            <button
              onClick={() => handleUpdateSelected("Disabled")}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Vô hiệu
            </button>
          </div>
        )}
      </div>

      {/* Lưới ghế có nhãn hàng & cột */}
      {seats.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* Dòng tiêu đề cột */}
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
                style={{ gridTemplateColumns: `repeat(${cols}, 2.5rem)` }}
              >
                {seats
                  .filter((s) => s.row === rowLetter)
                  .map((seat, index) => (
                    <Seat
                      key={index}
                      data={seat}
                      isSelected={selectedSeats.includes(
                        `${seat.row}${seat.column}`
                      )}
                      onToggleSelect={() => toggleSelect(seat.row, seat.column)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
