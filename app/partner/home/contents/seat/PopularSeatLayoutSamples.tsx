import React from "react";
import { Button } from "@/components/ui/button";

export type SeatTemplateCell = "S" | "M" | "V" | "C" | "K" | "_";

export interface PopularSeatLayoutSample {
  id: string;
  name: string;
  rows: number;
  cols: number;
  layout: string[];
  notes: string[];
}

interface PopularSeatLayoutSamplesProps {
  onApplySample: (sample: PopularSeatLayoutSample) => void;
}

const CELL_META: Record<
  SeatTemplateCell,
  {
    label: string;
    className: string;
    ariaLabel?: string;
  }
> = {
  S: {
    label: "Ghế thường",
    className:
      "bg-slate-500/90 text-white shadow-[0_0_6px_rgba(148,163,184,0.45)]",
    ariaLabel: "Ghế thường",
  },
  M: {
    label: "Ghế thường (vô hiệu)",
    className:
      "border border-dashed border-slate-500/70 bg-transparent text-slate-400",
    ariaLabel: "Ghế thường bị vô hiệu",
  },
  V: {
    label: "Ghế VIP",
    className:
      "bg-amber-500 text-white shadow-[0_0_6px_rgba(245,158,11,0.55)]",
    ariaLabel: "Ghế VIP",
  },
  C: {
    label: "Ghế đôi",
    className:
      "bg-rose-500 text-white shadow-[0_0_6px_rgba(244,114,182,0.55)]",
    ariaLabel: "Ghế đôi",
  },
  K: {
    label: "Ghế đôi (vô hiệu)",
    className:
      "border border-dashed border-rose-400/60 bg-transparent text-rose-200/70",
    ariaLabel: "Ghế đôi bị vô hiệu",
  },
  _: {
    label: "Lối đi",
    className: "border border-dashed border-zinc-700/70 bg-transparent",
    ariaLabel: "Khoảng trống / lối đi",
  },
};

const createCgvLayout = () => {
  const totalRows = 8; // A-H
  const totalCols = 20; // 1-20
  const layout: string[] = [];

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    let row = "";
    for (let colIndex = 0; colIndex < totalCols; colIndex += 1) {
      if (rowIndex <= 2) {
        // A-C: ghế thường, vô hiệu ghế số 20
        row += colIndex === totalCols - 1 ? "M" : "S";
        continue;
      }

      if (rowIndex >= 3 && rowIndex <= 6) {
        // D-G: ghế VIP
        row += "V";
        continue;
      }

      // H: ghế đôi, vô hiệu hoá các ghế 1,2,19,20
      const isDisabledCoupleSeat =
        colIndex === 0 || colIndex === 1 || colIndex === totalCols - 2 || colIndex === totalCols - 1;
      row += isDisabledCoupleSeat ? "K" : "C";
    }
    layout.push(row);
  }

  return layout;
};

const CGV_SAMPLE: PopularSeatLayoutSample = {
  id: "cgv-sample",
  name: "Sơ đồ mẫu CGV",
  rows: 8,
  cols: 20,
  layout: createCgvLayout(),
  notes: [
    "Các dãy A–C là ghế thường, ghế số 20 được vô hiệu hoá để chừa lối đi.",
    "Các dãy D–G là ghế VIP với tầm nhìn trung tâm.",
    "Dãy H là ghế đôi, vô hiệu hoá ghế H1, H2, H19 và H20.",
  ],
};

const createLotteLayout = () => {
  const totalRows = 9; // A-I
  const totalCols = 18; // 1-18
  const layout: string[] = [];

  const maintenanceColumns = new Set([3, 6, 11, 16]);
  const rearDisabledRows = new Set(["A", "B", "C", "D", "E", "F", "G"]);
  const vipRows = new Set(["D", "E", "F", "G", "H"]);
  const vipColumns = new Set([4, 5, 7, 8, 9, 10, 12, 13, 14, 15]);

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    let row = "";

    for (let colIndex = 0; colIndex < totalCols; colIndex += 1) {
      const columnNumber = colIndex + 1;

      if (maintenanceColumns.has(columnNumber)) {
        row += "M";
        continue;
      }

      if (rowLabel === "A" && columnNumber === 15) {
        row += "M";
        continue;
      }

      if (columnNumber >= 17 && columnNumber <= 18) {
        if (rearDisabledRows.has(rowLabel)) {
          row += "M";
          continue;
        }

        if (rowLabel === "H" || rowLabel === "I") {
          row += "S";
          continue;
        }
      }

      if (rowLabel === "I") {
        row += "S";
        continue;
      }

      if (
        (rowLabel === "D" || rowLabel === "E" || rowLabel === "F" || rowLabel === "G" || rowLabel === "H") &&
        (columnNumber === 1 || columnNumber === 2)
      ) {
        row += "S";
        continue;
      }

      if (vipRows.has(rowLabel) && vipColumns.has(columnNumber)) {
        row += "V";
        continue;
      }

      row += "S";
    }

    layout.push(row);
  }

  return layout;
};

const LOTTE_SAMPLE: PopularSeatLayoutSample = {
  id: "lotte-sample",
  name: "Sơ đồ mẫu Lotte Cinema",
  rows: 9,
  cols: 18,
  layout: createLotteLayout(),
  notes: [
    "Các cột 3, 6, 11, 16 bị vô hiệu hoá (Z0) xuyên suốt các hàng.",
    "Các hàng A–C cùng hàng I sử dụng ghế thường, riêng cụm A/G cột 17–18 được vô hiệu hoá.",
    "Các hàng D–H có ghế thường tại cột 1–2; cụm trung tâm cột 4–5, 7–10, 12–15 bố trí ghế VIP (bao gồm H13, H14).",
    "Ghế A15 và cụm cột 17–18 (trừ H17–H18, I17–I18) được vô hiệu hoá để tạo lối đi.",
  ],
};

const createBhdLayout = () => {
  const totalRows = 12; // A-L
  const totalCols = 20; // 1-20
  const layout: string[] = [];

  const standardRows = new Set(["A", "B", "C", "D", "E", "K"]);
  const disabledSeats = new Set([
    "D1",
    "D2",
    "D3",
    "E1",
    "E2",
    "E3",
    "F1",
    "F2",
    "G1",
    "G2",
    "H1",
    "H2",
    "I1",
    "I2",
    "J1",
    "J2",
    "K1",
    "K2",
    "L1",
    "L2",
    "L19",
    "L20",
  ]);
  const vipRows = new Set(["F", "G", "H", "I", "K"]);

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    let row = "";

    for (let colIndex = 0; colIndex < totalCols; colIndex += 1) {
      const columnNumber = colIndex + 1;
      const seatKey = `${rowLabel}${columnNumber}`;

      if (disabledSeats.has(seatKey)) {
        row += "M";
        continue;
      }

      if (rowLabel === "L" && columnNumber >= 3 && columnNumber <= 18) {
        row += "C";
        continue;
      }

      if (vipRows.has(rowLabel) && columnNumber >= 5 && columnNumber <= 18) {
        row += "V";
        continue;
      }

      if (standardRows.has(rowLabel)) {
        row += "S";
        continue;
      }

      row += "S";
    }

    layout.push(row);
  }

  return layout;
};

const BHD_SAMPLE: PopularSeatLayoutSample = {
  id: "bhd-sample",
  name: "Sơ đồ mẫu BHD Star",
  rows: 12,
  cols: 20,
  layout: createBhdLayout(),
  notes: [
    "Hàng A–E và K dùng ghế thường, các ghế đầu hàng D–K được vô hiệu hoá để tạo lối vào.",
    "Các hàng F–K có cụm ghế VIP từ cột 5 đến cột 18 (F5 – K18).",
    "Hàng L (L3 – L18) bố trí ghế đôi, góc đầu/cuối hàng bị vô hiệu.",
  ],
};

const POPULAR_SAMPLES: PopularSeatLayoutSample[] = [
  CGV_SAMPLE,
  LOTTE_SAMPLE,
  BHD_SAMPLE,
];

interface SeatPreviewProps {
  layout: string[];
  onApply: () => void;
  name: string;
  rows: number;
  cols: number;
  notes: string[];
}

const SeatPreview: React.FC<SeatPreviewProps> = ({
  layout,
  onApply,
  name,
  rows,
  cols,
  notes,
}) => {
  if (!layout.length) return null;

  const columnCount = layout[0].length;
  const seatPixel = 16;
  const maxPreviewDimension = 192;
  const gridWidth = columnCount * seatPixel;
  const gridHeight = layout.length * seatPixel;
  const scale = Math.min(
    maxPreviewDimension / gridWidth,
    maxPreviewDimension / gridHeight,
    1
  );
  const seatStyle: React.CSSProperties = {
    width: seatPixel,
    height: seatPixel,
  };

  return (
    <button
      type="button"
      onClick={onApply}
      className="group relative w-full overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-4 text-left transition hover:border-orange-400/60 hover:bg-zinc-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <div className="mb-2 flex flex-col items-center gap-2 text-center text-zinc-400">
        <span className="w-24 border-b border-dashed border-zinc-700" />
        <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500">
          Màn hình
        </p>
      </div>
      <div
        className="flex justify-center"
        style={{ minHeight: maxPreviewDimension }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, ${seatPixel}px)`,
              gap: 0,
            }}
          >
            {layout.map((row, rowIndex) =>
              row.split("").map((cell, columnIndex) => {
                const key = cell as SeatTemplateCell;
                const meta = CELL_META[key] ?? CELL_META.S;
                return (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={`rounded-sm text-[9px] font-medium leading-none ${meta.className}`}
                    aria-label={meta.ariaLabel}
                    style={seatStyle}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <p className="font-medium text-orange-300">
          Nhấn để áp dụng
        </p>
        <span className="text-[10px] text-zinc-400">
          {rows}x{cols}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 flex translate-y-4 flex-col justify-end bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent px-4 py-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-zinc-100">{name}</h4>
          <p className="text-[11px] text-zinc-300/90">
            Bố cục {rows} hàng x {cols} cột
          </p>
        </div>
        <ul className="mt-2 space-y-1 text-[11px] text-zinc-200/90">
          {notes.map((note: string, index: number) => (
            <li key={index} className="flex gap-2">
              <span className="inline-block h-1 w-1 shrink-0 translate-y-1 rounded-full bg-orange-400" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
};

export const PopularSeatLayoutSamples: React.FC<PopularSeatLayoutSamplesProps> = ({
  onApplySample,
}) => {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-zinc-900/60 p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-white sm:text-lg">
          Sơ đồ ghế mẫu
        </h3>
      
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {POPULAR_SAMPLES.map((sample) => {
          return (
            <div key={sample.id} className="flex flex-col gap-3">
              <SeatPreview
                layout={sample.layout}
                onApply={() => onApplySample(sample)}
                name={sample.name}
                rows={sample.rows}
                cols={sample.cols}
                notes={sample.notes}
              />
              <Button
                onClick={() => onApplySample(sample)}
                className="w-full bg-orange-400 text-sm text-zinc-900 hover:bg-orange-300"
              >
                Áp dụng {sample.name}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularSeatLayoutSamples;
