import { Pacifico } from "next/font/google";


interface NavbarProps {
  setLoginForm: (value: boolean) => void;
  action: () => void;
}

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

const Navbar = (props: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
      <h1
        className={`${pacifico.className} text-3xl font-bold text-white drop-shadow-lg`}
      >
        TicketXpress
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => props.setLoginForm(true)}
          className="px-8 py-3 bg-white/90 hover:bg-white rounded-full text-black font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Đăng Nhập
        </button>
        <button
          onClick={props.action}
          className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-semibold transition-all border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Liên Hệ
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
