import React from "react";

interface SearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SearchModal = (props: SearchModalProps) => {
  return (
    <div className="fixed w-full h-screen bg-zinc-950/50 flex items-center justify-center py-20">
      <div className="w-3xl bg-zinc-900 rounded-lg px-6 h-screen">

      </div>
    </div>
  );
};

export default SearchModal;
