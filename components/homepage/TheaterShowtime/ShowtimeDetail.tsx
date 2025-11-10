import Image from "next/image";
import React from "react";

const ShowtimeDetail = () => {
  return (
    <div className="w-full h-screen bg-white/10 flex flex-col items-center justify-baseline rounded-2xl p-3">
      <div className="w-full flex items-center">
        <Image src={""} alt="" width={50} height={50}/>
        <div className="flex flex-col items-center justify-baseline">
          <h1>Tên rạp</h1>
          <p>địa chỉ</p>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetail;
