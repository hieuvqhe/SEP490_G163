import React from "react";

const Page = () => {
  const seats: SeatData[] = [];
  const rows = ["A", "B", "C", "D", "E"];
  const cols = [1, 2, 3, 4, 5];

  rows.forEach((row) => {
    cols.forEach((col) => {
      seats.push({ row, column: col, seatTypeId: 1, status: "Available" });
    });
  });

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Seat Booking</h1>
      <div className={`grid grid-cols-5 gap-3`}>
        {seats.map((seat, index) => (
          <Seat key={index} {...seat} />
        ))}
      </div>
    </div>
  );
};

interface SeatData {
  row: string;
  column: number;
  seatTypeId: number;
  status: "Available" | "Booked" | "Reserved";
}

const Seat: React.FC<SeatData> = ({ row, column, status }) => {
  const color =
    status === "Available"
      ? "bg-green-500 hover:bg-green-600"
      : status === "Booked"
      ? "bg-red-500"
      : "bg-yellow-500";

  return (
    <div
      className={`w-10 h-10 ${color} rounded-md flex items-center justify-center cursor-pointer transition font-semibold text-white`}
    >
      {row}
      {column}
    </div>
  );
};

export default Page;
