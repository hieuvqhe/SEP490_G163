"use client"

import { IoIosCalendar } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { BsArrowRight } from "react-icons/bs";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";

interface Banner {
  _id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  type: "home_slider" | "promotion" | "announcement";
  position: number;
  status?: "active" | "inactive"; // API uses 'status' instead of 'is_active'
  is_active?: boolean; // Keep for backward compatibility
  start_date?: string;
  end_date?: string;
  movie_id?: string; // API includes movie_id
  created_at?: string; // API uses created_at instead of createdAt
  updated_at?: string; // API uses updated_at instead of updatedAt
  createdAt?: string; // Keep for backward compatibility
  updatedAt?: string; // Keep for backward compatibility
  movie?: {
    _id: string;
    title: string;
    poster_url: string;
  }; // API includes movie object
}

const HeroSection = () => {
  const sliderBanners: Banner[] = [
    {
      _id: "b001",
      title: "Deadpool & Wolverine: Song Sát Tái Xuất",
      description:
        "Bộ đôi lắm mồm trở lại cùng hành trình hỗn loạn chưa từng có. Khởi chiếu 15/10.",
      image_url: "/deadpool-wolverine.webp",
      link_url: "/movies/deadpool-wolverine",
      type: "home_slider",
      position: 1,
      status: "active",
      start_date: "2025-10-01T00:00:00Z",
      end_date: "2025-10-31T23:59:59Z",
      movie_id: "m001",
      created_at: "2025-09-25T10:00:00Z",
      updated_at: "2025-10-01T08:00:00Z",
      movie: {
        _id: "m001",
        title: "Deadpool & Wolverine",
        poster_url: "https://cdn.cinemaapp.com/posters/deadpool-wolverine.jpg",
      },
    },
    {
      _id: "b002",
      title: "Joker: Folie à Deux - Cuồng loạn trở lại",
      description:
        "Joaquin Phoenix tái xuất cùng Lady Gaga trong phần tiếp theo đầy ám ảnh.",
      image_url: "/joker_-folie-deux-2024-poster.avif",
      link_url: "/movies/joker-folie",
      type: "home_slider",
      position: 2,
      status: "active",
      start_date: "2025-10-05T00:00:00Z",
      end_date: "2025-11-05T23:59:59Z",
      movie_id: "m002",
      created_at: "2025-09-26T09:00:00Z",
      updated_at: "2025-10-05T09:00:00Z",
      movie: {
        _id: "m002",
        title: "Joker: Folie à Deux",
        poster_url: "https://cdn.cinemaapp.com/posters/joker-folie.jpg",
      },
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: "linear",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case "home_slider":
        return "Featured";
      case "movie_promotion":
        return "Movie";
      case "promotion":
        return "Promotion";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  // No banners state
  if (!sliderBanners || sliderBanners.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white max-w-md px-6"
        >
          <h2 className="text-2xl font-bold mb-4">No banners available</h2>
          <p className="text-gray-300 mb-6">
            Check back later for exciting content!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/movies")}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium mx-auto transition-colors duration-200"
          >
            Explore Movies
            <BsArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Slider {...settings}>
        {sliderBanners?.map((banner, index) => (
          <div key={banner._id} className="relative h-screen w-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${banner.image_url}')`,
              }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60" />

            {/* Content */}
            <div className="relative z-10 flex items-center h-full px-6 md:px-16 lg:px-36">
              <motion.div
                className="flex flex-col gap-4 max-w-2xl"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                {/* Position Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                    #{banner.position}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Position {banner.position} of {sliderBanners.length}
                  </span>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {banner.title}
                </motion.h1>

                <motion.div
                  className="flex items-center gap-4 text-gray-300 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <span className="bg-primary px-3 py-1 rounded-full text-sm font-medium">
                    {getTypeDisplay(banner.type)}
                  </span>

                  {banner.start_date && (
                    <div className="flex items-center gap-1">
                      <IoIosCalendar className="w-4 h-4" />
                      <span className="text-sm">
                        From {formatDate(banner.start_date)}
                      </span>
                    </div>
                  )}

                  {banner.end_date && (
                    <div className="flex items-center gap-1">
                      <GoClock className="w-4 h-4" />
                      <span className="text-sm">
                        Until {formatDate(banner.end_date)}
                      </span>
                    </div>
                  )}
                </motion.div>

                <motion.p
                  className="text-lg text-gray-200 leading-relaxed max-h-20 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {banner.description}
                </motion.p>

                <motion.button
                  className="flex items-center gap-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition-all duration-300 rounded-full font-medium cursor-pointer max-w-fit text-white group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {banner.link_url ? "View Details" : "Explore Movies"}
                  <BsArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>

                {/* Banner Info */}
                <motion.div
                  className="mt-4 text-xs text-gray-400 opacity-70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {banner.status === "active" ? (
                    <span className="text-green-400">● Active Banner</span>
                  ) : (
                    <span className="text-gray-500">● Inactive Banner</span>
                  )}
                  {banner.movie_id && (
                    <span className="ml-3">Movie ID: {banner.movie_id}</span>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSection;
