import React from "react";
import TestComponent, { CheckOutProps } from "./TestComponent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const page = () => {
  const mockData: CheckOutProps = {
    sessionId: "SESSION_ABC_123",

    selectedCombos: [
      {
        serviceId: 1,
        quantity: 2,
        servicesTitle: "Bắp ngọt lớn",
      },
      {
        serviceId: 2,
        quantity: 1,
        servicesTitle: "Nước ngọt 500ml",
      },
    ],

    selectedSeats: [
      { seatId: 101, seatTitle: "A1" },
      { seatId: 102, seatTitle: "A2" },
      { seatId: 203, seatTitle: "B3" },
    ],

    cinemaName: "CGV Aeon Tân Phú",
    roomName: "Phòng 5",
    roomFormat: "IMAX",

    qrCode:
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=test",

    totalPrice: 245000,

    previewSession: {
      appliedVoucherCode: "SALE20",
      total: 225000,
    },

    curentOrderId: "ORDER_987654",

    showtimeId: 5566,
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>
            <button>
                ShowDialog
            </button>
        </DialogTrigger>
        <TestComponent {...mockData} />
      </Dialog>
    </div>
  );
};

export default page;
