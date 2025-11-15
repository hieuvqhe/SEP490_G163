import { SeatData } from "./SeatLayout";

type SeatVariant = "single" | "coupleLeft" | "coupleRight";

export const Seat: React.FC<{
  data: SeatData;
  isSelected: boolean;
  onToggleSelect: () => void;
  label: string;
  isPreview: boolean;
  variant?: SeatVariant;
}> = ({ data, isSelected, onToggleSelect, label, isPreview, variant }) => {
  const { status } = data;

  let seatStyles = "";
  let textColor = "text-white";
  let seatStyleInline = {};

  if (status === "Maintenance") {
    seatStyles = isPreview
      ? "bg-transparent cursor-not-allowed"
      : "bg-transparent border border-dashed border-gray-400 cursor-not-allowed";
    textColor = "text-gray-400";
  } else if (isSelected)
    seatStyles = "bg-yellow-500 hover:bg-yellow-600 cursor-pointer";
  else if (status === "Available") {
    seatStyles += "hover:bg-green-600 cursor-pointer";
    seatStyleInline = { backgroundColor: data.colorCode };
  } else if (status === "Blocked") seatStyles = "bg-red-500 cursor-pointer";

  const variantClass = (() => {
    switch (variant) {
      case "coupleLeft":
        return "rounded-l-full rounded-r-none";
      case "coupleRight":
        return "rounded-r-full rounded-l-none";
      default:
        return "rounded-md";
    }
  })();

  const classNames = [
    "w-10",
    "h-10",
    seatStyles,
    "opacity-80",
    variantClass,
    "flex",
    "items-center",
    "justify-center",
    "font-semibold",
    textColor,
    "transition",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      onClick={() => status !== "Maintenance" && onToggleSelect()}
      className={classNames}
      style={seatStyleInline}
    >
      {status === "Maintenance" && isPreview ? "" : label}
    </div>
  );
};
