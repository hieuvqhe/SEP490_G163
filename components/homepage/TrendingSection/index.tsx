"use client";

import { useState, useRef } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Movie } from "@/types/movie.type";
import Image from "next/image";

const TrendingSection = () => {
  // Dữ liệu mẫu để test khi API lỗi
  const mockMovies: Movie[] = [
    {
      movie_id: 1,
      title: "Deadpool & Wolverine",
      genre: "Hành động, Hài, Siêu anh hùng",
      duration_minutes: 128,
      release_date: "2025-10-15T00:00:00Z",
      director: "Shawn Levy",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=1",
      production: "Marvel Studios",
      description: "Hai dị nhân lắm mồm và gắt gỏng buộc phải hợp tác trong một nhiệm vụ xuyên vũ trụ đầy hỗn loạn và hài hước."
    },
    {
      movie_id: 2,
      title: "Joker: Folie à Deux",
      genre: "Tâm lý, Nhạc kịch, Hình sự",
      duration_minutes: 142,
      release_date: "2025-11-01T00:00:00Z",
      director: "Todd Phillips",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=2",
      production: "Warner Bros",
      description: "Arthur Fleck trở lại cùng Harley Quinn trong câu chuyện tình điên loạn, nơi ranh giới giữa thực và ảo hoàn toàn bị xoá nhoà."
    },
    {
      movie_id: 3,
      title: "Avatar: The Way of Water",
      genre: "Khoa học viễn tưởng, Phiêu lưu",
      duration_minutes: 192,
      release_date: "2024-12-16T00:00:00Z",
      director: "James Cameron",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=3",
      production: "20th Century Studios",
      description: "Jake Sully và gia đình khám phá thế giới đại dương của Pandora."
    },
    {
      movie_id: 4,
      title: "Spider-Man: No Way Home",
      genre: "Hành động, Siêu anh hùng",
      duration_minutes: 148,
      release_date: "2024-12-17T00:00:00Z",
      director: "Jon Watts",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=4",
      production: "Marvel Studios",
      description: "Peter Parker phải đối mặt với hậu quả khi danh tính bí mật của anh bị tiết lộ."
    },
    {
      movie_id: 5,
      title: "Top Gun: Maverick",
      genre: "Hành động, Phiêu lưu",
      duration_minutes: 131,
      release_date: "2024-05-27T00:00:00Z",
      director: "Joseph Kosinski",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=5",
      production: "Paramount Pictures",
      description: "Maverick trở lại với nhiệm vụ nguy hiểm nhất trong sự nghiệp của mình."
    },
    {
      movie_id: 6,
      title: "Black Panther: Wakanda Forever",
      genre: "Hành động, Siêu anh hùng",
      duration_minutes: 161,
      release_date: "2024-11-11T00:00:00Z",
      director: "Ryan Coogler",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=6",
      production: "Marvel Studios",
      description: "Wakanda đối mặt với thử thách mới sau cái chết của Vua T'Challa."
    },
    {
      movie_id: 7,
      title: "The Batman",
      genre: "Hành động, Tội phạm, Siêu anh hùng",
      duration_minutes: 176,
      release_date: "2024-03-04T00:00:00Z",
      director: "Matt Reeves",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=7",
      production: "Warner Bros",
      description: "Batman điều tra một loạt vụ giết người bí ẩn ở Gotham City."
    },
    {
      movie_id: 8,
      title: "Doctor Strange in the Multiverse of Madness",
      genre: "Hành động, Siêu anh hùng, Kỳ ảo",
      duration_minutes: 126,
      release_date: "2024-05-06T00:00:00Z",
      director: "Sam Raimi",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=8",
      production: "Marvel Studios",
      description: "Doctor Strange khám phá đa vũ trụ và đối mặt với những mối đe dọa mới."
    },
    {
      movie_id: 9,
      title: "Thor: Love and Thunder",
      genre: "Hành động, Siêu anh hùng, Hài",
      duration_minutes: 119,
      release_date: "2024-07-08T00:00:00Z",
      director: "Taika Waititi",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=9",
      production: "Marvel Studios",
      description: "Thor cùng với Valkyrie và Korg đối đầu với Gorr the God Butcher."
    },
    {
      movie_id: 10,
      title: "Black Widow",
      genre: "Hành động, Siêu anh hùng, Gián điệp",
      duration_minutes: 134,
      release_date: "2024-07-09T00:00:00Z",
      director: "Cate Shortland",
      language: "Tiếng Anh",
      country: "Mỹ",
      is_active: true,
      poster_url: "https://picsum.photos/200/300?random=10",
      production: "Marvel Studios",
      description: "Natasha Romanoff đối mặt với quá khứ đen tối của mình."
    }
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Sử dụng dữ liệu mẫu thay vì API
  const trendingMovies = mockMovies;
  const isLoading = false;
  const isError = false;
  const error = null;

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getRandomViewCount = () => {
    return Math.floor(Math.random() * 10000000) + 10000;
  };

  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1);
  };

  const getRandomChapters = () => {
    const chapter = Math.floor(Math.random() * 100) + 1;
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    return {
      chapter,
      daysAgo,
    };
  };

  // Không cần loading state vì đang sử dụng dữ liệu mẫu
  if (!trendingMovies.length) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20">
        <div className="text-center">
          <p className="text-gray-400">Không có phim trending nào để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">
            TOP THỊNH HÀNH
            <div className="w-16 h-1 bg-red-500 mt-2"></div>
          </h2>
          <p className="text-gray-300 text-lg">
            Phim được mọi người yêu thích.
          </p>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <BsChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <BsChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {trendingMovies.map((movie, index) => {
            const viewCount = getRandomViewCount();
            const rating = getRandomRating();
            const chapters = getRandomChapters();
            
            return (
              <div
                key={movie.movie_id}
                className="flex-shrink-0 group relative"
              >
                {/* Ranking Number Background */}
                <div className="absolute -left-8 -top-4 text-8xl font-black text-orange-400/20 select-none pointer-events-none z-0">
                  {index + 1}
                </div>

                {/* Movie Card */}
                <div className="relative z-10 bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden w-48 hover:scale-105 hover:shadow-2xl transition-all duration-300 group-hover:shadow-orange-500/20">
                  {/* Poster Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={movie.poster_url || '/default-poster.jpg'}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Platform Logo */}
                    <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">H</span>
                  </div>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {movie.title}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(parseFloat(rating))
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-white text-sm font-medium">{rating}</span>
                    </div>

                    {/* View Count */}
                    <div className="mb-3">
                      <span className="inline-block bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded">
                        {formatViewCount(viewCount)} lượt xem
                      </span>
                    </div>

                    {/* Recent Updates */}
                    <div className="space-y-1">
                      <div className="text-white text-sm">
                        Chapter #{chapters.chapter}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {chapters.daysAgo} ngày trước
                      </div>
                      <div className="w-full h-px bg-gray-600"></div>
                      <div className="text-white text-sm">
                        Chapter #{chapters.chapter - 1}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {chapters.daysAgo + 2} ngày trước
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;
