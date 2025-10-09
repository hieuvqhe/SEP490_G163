"use client";

import { IoIosSearch } from "react-icons/io";
import { FaTimes, FaFilter } from "react-icons/fa";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigationItems = [
    { title: "Xem Ngay", link: "/" },
    { title: "Điểm Thưởng", link: "/movies" },
    { title: "Yêu Thích", link: "/movies" },
    { title: "Đang chiếu", link: "/movies" },
  ];

  return (
    <>
      <div className="md:hidden fixed top-4 right-4 z-50 flex gap-40 items-center">
        <div className="relative">
          {isOpen ? (
            <IoIosSearch
              className={`w-6 h-6 cursor-pointer transition-colors duration-300 hover:text-orange-500 ${
                isSearchOpen ? "text-orange-500" : ""
              }`}
            />
          ) : (
            <></>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-gray-800 text-white transition-all duration-300"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700
        sm:inset-x-6 flex items-center justify-between px-4 max-md:hidden`}
      >
        <div className="flex items-center gap-10">
          <Link href={"/"} className="max-md:flex-1">
            <Image
              src={"/logo.png"}
              alt=""
              className={`transition-all duration-300`}
              width={60}
              height={60}
            />
          </Link>

          <InputGroup
            className="h-11 w-xs lg:w-md  rounded-full backdrop-blur bg-gray-400/20 
          border-gray-300/20 overflow-hidden 
          transition-[width] duration-300"
          >
            <InputGroupInput
              placeholder="Tìm tên phim, diễn viên"
              className="border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 focus:outline-none"
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div>
          <div className="flex items-center">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                className="nav-hover-btn"
                href={item.link}
                onClick={() => setIsOpen(!isOpen)}
              >
                {item.title}
              </Link>
            ))}
          </div>
          
          {/* User button */}
          {/* Login button */}
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Header;
