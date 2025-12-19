"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const genres = [
  "Tất cả",
  "Hành động",
  "Kinh dị",
  "Tình cảm",
  "Hài",
  "Khoa học viễn tưởng",
  "Phiêu lưu",
  "Hoạt hình",
  "Tâm lý",
  "Trinh thám",
];

const languages = [
  "Tất cả",
  "Tiếng Việt",
  "Tiếng Anh",
  "Tiếng Hàn",
  "Tiếng Nhật",
  "Tiếng Trung",
];

interface FilterSectionProps {
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

export default function FilterSection({
  selectedGenre,
  setSelectedGenre,
  selectedLanguage,
  setSelectedLanguage,
}: FilterSectionProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleReset = () => {
    setSelectedGenre("Tất cả");
    setSelectedLanguage("Tất cả");
  };

  return (
    <div className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Bộ lọc</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
        {/* Genre Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Thể loại</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className="rounded-full"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Ngôn ngữ</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <Button
                key={language}
                variant={selectedLanguage === language ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(language)}
                className="rounded-full"
              >
                {language}
              </Button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        {(selectedGenre !== "Tất cả" || selectedLanguage !== "Tất cả") && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
