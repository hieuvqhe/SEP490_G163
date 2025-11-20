import React, { Dispatch, SetStateAction, useState } from "react";

interface RatingStarProps {
  setRatingStar: Dispatch<SetStateAction<number>>;
}

const RateStar = (props: RatingStarProps) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleLogRate = (value: number) => {
    setSelectedRating(value);
    props.setRatingStar(value);
    console.log(value);
  };

  return (
    <div className="flex justify-center space-x-2">
      {[1, 2, 3, 4, 5].map((value) => {
        const isActive = value <= (hoverRating || selectedRating);

        return (
          <label
            key={value}
            htmlFor={`rating-${value}`}
            title={`${value} star${value > 1 ? "s" : ""}`}
            className={`
              cursor-pointer text-xs transition-all duration-300
              hover:scale-125
              ${isActive ? "text-amber-500 drop-shadow-glow" : "text-gray-400"}
            `}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleLogRate(value)}
          >
            <input
              type="radio"
              id={`rating-${value}`}
              name="rating"
              value={value}
              className="hidden"
              checked={selectedRating === value}
              onChange={() => setSelectedRating(value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 fill-current transition-all duration-300"
              viewBox="0 0 576 512"
            >
              <path
                d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 
              150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 
              7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 
              31.3s23 8 33.8 2.3l128.3-68.5 128.3 
              68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 
              12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 
              11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 
              150.3 316.9 18z"
              />
            </svg>
          </label>
        );
      })}
    </div>
  );
};

export default RateStar;
