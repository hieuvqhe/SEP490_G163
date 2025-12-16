"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MovieList from "./components/MovieList";
import FilterSection from "./components/FilterSection";

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Tất cả");

  return (
    <main className="min-h-screen px-6 md:px-16 lg:px-24 xl:px-44 py-20">
      <div className="mt-20">
        <h1 className="text-4xl font-bold mb-2">Phim Đang Chiếu</h1>
        <p className="text-gray-400 mb-8">Khám phá những bộ phim đang hot nhất hiện nay</p>
        
        {!searchQuery && (
          <FilterSection 
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        )}
        <MovieList 
          selectedGenre={selectedGenre}
          selectedLanguage={selectedLanguage}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}
