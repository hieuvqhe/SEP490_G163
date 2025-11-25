"use client";

import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";

interface Brand {
  code: string;
  name: string;
  logoUrl: string;
}

interface TheaterSelectorProps {
  brands?: Brand[];
  onSelect?: Dispatch<SetStateAction<string>>;
}

const TheaterSelector = ({ brands, onSelect }: TheaterSelectorProps) => {
  // console.log(brands?.[0]?.code ?? "CGV");

  const [selectedCode, setSelectedCode] = useState("");

  useEffect(() => {
    if (brands && brands.length > 0) {
      setSelectedCode(brands[0].code);
    }
  }, [brands]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {brands?.map((brand) => (
        <div
          key={brand.code}
          onClick={() => {
            setSelectedCode(brand.code);
            onSelect?.(brand.code || "all");
          }}
          className={clsx(
            "w-20 h-20 flex items-center justify-center rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 bg-zinc-900 hover:bg-zinc-800",
            selectedCode === brand.code
              ? "border-[#f84565] shadow-md"
              : "border-transparent"
          )}
        >
          <Image
            src={
              brand.logoUrl ??
              "https://seeklogo.com/images/C/cj-cgv-logo-D89F116F7C-seeklogo.com.png"
            }
            alt={brand.name}
            width={64}
            height={64}
            className="object-contain p-2"
          />
        </div>
      ))}
    </div>
  );
};

export default TheaterSelector;
