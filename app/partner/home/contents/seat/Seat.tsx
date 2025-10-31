import { SeatData } from "./SeatLayout";

export const Seat: React.FC<{
  data: SeatData;
  isSelected: boolean;
  onToggleSelect: () => void;
  label: string;
  isPreview: boolean;
}> = ({ data, isSelected, onToggleSelect, label, isPreview }) => {
  const { status } = data;

  let seatStyles = "";
  let textColor = "text-white";
  let seatStyleInline = {};

  if (status === "Disabled") {
    seatStyles = isPreview
      ? "bg-transparent cursor-not-allowed"
      : "bg-transparent border border-dashed border-gray-400 cursor-not-allowed";
    textColor = "text-gray-400";
  } else if (isSelected)
    seatStyles = "bg-yellow-500 hover:bg-yellow-600 cursor-pointer";
  else if (status === "Available") {
    seatStyles += "hover:bg-green-600 cursor-pointer";
    seatStyleInline = { backgroundColor: data.colorCode };
  } else if (status === "Booked") seatStyles = "bg-red-500 cursor-pointer";

  return (
    <div
      onClick={() => status !== "Disabled" && onToggleSelect()}
      className={`w-10 h-10 ${seatStyles} rounded-md flex items-center justify-center font-semibold ${textColor} transition`}
      style={seatStyleInline}
    >
      {status === "Disabled" && isPreview ? "" : label}
    </div>
  );
};
