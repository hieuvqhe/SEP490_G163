import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  useCreateCheckout,
  useGetBookingSessionCombos,
  usePostPricingPreview,
  useUpsertBookingSessionCombos,
} from "@/apis/user.booking-session.api";
import Image from "next/image";
import { useState } from "react";
import CheckoutDetail from "./CheckoutDetail";
import { useCreatePayOS } from "@/apis/user.payment.api";

interface CombosDialogReq {
  sessionId?: string;
  selectedSeats?: { seatId: number; seatTitle: string }[];
}

const CombosDialog = ({ sessionId, selectedSeats }: CombosDialogReq) => {
  const { data: getBookingComboRes, isLoading: combosLoading } =
    useGetBookingSessionCombos(sessionId ?? "", true);

  const upsertComboMutate = useUpsertBookingSessionCombos();
  const previewOrderMutate = usePostPricingPreview();
  const checkoutMutate = useCreateCheckout();
  const createPaymentMutate = useCreatePayOS();

  const combos = getBookingComboRes?.result.combos ?? [];
  const currency = getBookingComboRes?.result.currency ?? "";
  const maxCurrent = getBookingComboRes?.result.selectionLimit ?? 8;

  type ComboCount = {
    serviceId: number;
    quantity: number;
    servicesTitle: string;
  };

  interface PostPricingPreview {
    appliedVoucherCode: string | null; // tùy API có thể null
    total: number;
  }

  // Mỗi combo có số lượng riêng → dùng object { comboCode: count }
  const [counts, setCounts] = useState<ComboCount[]>([]);
  const [checkoutDialog, setCheckoutDialog] = useState<boolean>(false);
  const [loadingSpin, setLoadingSpin] = useState<boolean>(false);
  const [previewSession, setPreviewSession] = useState<PostPricingPreview>();
  const [qrCode, setQrCode] = useState<string>();
  const [curentOrderId, setCurentOrderId] = useState<string>();

  if (combosLoading) return null;

  const increase = (serviceId: number, servicesTitle: string) => {
    setCounts((prev) => {
      const exists = prev.find((c) => c.serviceId === serviceId);
      if (exists) {
        return prev.map((c) =>
          c.serviceId === serviceId
            ? { ...c, quantity: c.quantity + 1, servicesTitle: c.servicesTitle }
            : c
        );
      }
      // chưa có → thêm mới
      return [
        ...prev,
        { serviceId, quantity: 1, servicesTitle: servicesTitle },
      ];
    });
  };

  const decrease = (serviceId: number) => {
    setCounts((prev) => {
      const exists = prev.find((c) => c.serviceId === serviceId);
      if (!exists) return prev;
      if (exists.quantity === 1) {
        // xóa luôn
        return prev.filter((c) => c.serviceId !== serviceId);
      }
      return prev.map((c) =>
        c.serviceId === serviceId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  const totalPrice = combos.reduce((sum, c) => {
    const item = counts.find((x) => x.serviceId === c.serviceId);
    return sum + (item?.quantity ?? 0) * c.price;
  }, 0);

  const currentCombos = counts;

  const handleCreatePayment = (orderId: string) => {
    console.log(orderId);
    setCurentOrderId(orderId);
    createPaymentMutate.mutate(
      {
        orderId: orderId ?? "",
        cancelUrl: "",
        returnUrl: "",
      },
      {
        onSuccess: (res) => {
          setQrCode(res.result.qrCode);
          setLoadingSpin(false);
          setCheckoutDialog(true);
        },
        onError: () => {
          console.log(`handleCreatePayment failed`);
        },
      }
    );
  };

  const handleSendCheckout = () => {
    checkoutMutate.mutate(
      {
        id: sessionId ?? "",
        body: {
          provider: "PayOS",
          cancelUrl: "",
          returnUrl: "",
        },
      },
      {
        onSuccess: (res) => handleCreatePayment(res.result.orderId),
        onError: () => {
          console.log(`handleGetPreview failed`);
        },
      }
    );
  };

  const handleGetPreview = () => {
    previewOrderMutate.mutate(
      {
        id: sessionId ?? "",
        voucherCode: "",
      },
      {
        onSuccess: (res) => {
          setPreviewSession({
            appliedVoucherCode: res.result.appliedVoucherCode,
            total: res.result.total,
          });
          handleSendCheckout();
        },
        onError: () => {
          console.log(`handleGetPreview failed`);
        },
      }
    );
  };

  const handleCheckout = () => {
    const items = counts.map((c) => ({
      serviceId: Number(c.serviceId),
      quantity: c.quantity,
    }));

    setLoadingSpin(true);
    console.log(items);

    upsertComboMutate.mutate(
      { id: sessionId ?? "", items: items.map((i) => i) },
      {
        onSuccess: () => handleGetPreview(),
        onError: () => {
          console.log(`handleCheckout failed`);
        },
      }
    );
  };

  return (
    <DialogContent className="!max-w-[450px] p-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden [&>button]:hidden">
      <DialogHeader className="bg-zinc-700 relative flex items-center justify-center py-3">
        <DialogTitle className="text-center text-white text-xl font-bold">
          Combo - Bắp nước
        </DialogTitle>

        <DialogClose className="absolute left-1">
          <IoChevronBackOutline
            className="cursor-pointer hover:scale-125 duration-150 transition-all"
            size={20}
          />
        </DialogClose>
      </DialogHeader>

      {/* Danh sách combos */}
      <div className="p-4 max-h-[350px] overflow-auto flex flex-col gap-4">
        {combos.map((c) => {
          const item = counts.find((x) => x.serviceId === c.serviceId);
          const count = item?.quantity ?? 0;

          return (
            <div
              key={c.code}
              className="flex gap-3 border border-white/10 rounded-xl p-3 bg-zinc-800"
            >
              <Image
                src={c.imageUrl}
                alt={c.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />

              <div className="flex flex-col justify-between w-full">
                <div>
                  <h1 className="font-semibold text-white">
                    {c.name} - {c.price}
                    {currency}
                  </h1>
                  <p className="text-sm text-zinc-300">{c.description}</p>
                </div>

                {/* Buttons tăng giảm */}
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    disabled={count === 0}
                    variant="outline"
                    onClick={() => decrease(c.serviceId)}
                    className="w-8 h-8 flex items-center justify-center"
                  >
                    -
                  </Button>

                  <div className="min-w-[28px] text-center text-white font-semibold">
                    {count}
                  </div>

                  <Button
                    disabled={count >= maxCurrent}
                    variant="outline"
                    onClick={() => increase(c.serviceId, c.name)}
                    className="w-8 h-8 flex items-center justify-center"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DialogFooter className="px-4 py-3 border-t border-white/10">
        <div className="w-full flex flex-col gap-2">
          <div className="flex w-full justify-between items-center text-white">
            <p>Tổng cộng</p>
            <p className="text-lg font-semibold">
              {totalPrice.toLocaleString()} {currency}
            </p>
          </div>
          <Dialog>
            <DialogTrigger>
              <Button
                onClick={handleCheckout}
                className="w-full"
                variant="outline"
                // disabled={loadingSpin}
              >
                {/* {loadingSpin ? <Spinner /> : `Tiếp tục`} */}
                Tiếp tục
              </Button>
            </DialogTrigger>
            {checkoutDialog && (
              <CheckoutDetail
                curentOrderId={curentOrderId ?? ""}
                sessionId={sessionId}
                selectedCombos={currentCombos}
                selectedSeats={selectedSeats}
                previewSession={previewSession}
                qrCode={qrCode}
              />
            )}
          </Dialog>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default CombosDialog;
