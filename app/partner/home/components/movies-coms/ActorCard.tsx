import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Actor {
  id: number;
  name: string;
  profileImage?: string | null;
}

interface ActorCardProps {
  actor: Actor;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const ActorCard = ({ actor, isSelected, onToggle }: ActorCardProps) => {
  return (
    <motion.div
    //   whileHover={{ scale: 1.03 }}
    //   whileTap={{ scale: 0.97 }}
      onClick={() => onToggle(actor.id)}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        border ${isSelected ? "border-primary" : "border-zinc-700"}
        shadow ${isSelected ? "shadow-primary/30" : "shadow-none"}
        bg-zinc-800 hover:border-zinc-600 group`}
    >
      {/* Checkmark overlay */}
      <div
        className={`absolute top-2 right-2 z-10 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <CheckCircle2
          className={`w-6 h-6 ${isSelected ? "text-primary" : "text-zinc-500"}`}
        />
      </div>

      {/* Actor Image */}
      <div className="aspect-[2/3] w-full overflow-hidden">
        <Image
          src={
            actor.profileImage ??
            "https://via.placeholder.com/300x450?text=No+Image"
          }
          alt={actor.name}
          width={300}
          height={450}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>

      {/* Name */}
      <div className="p-3 text-center">
        <p className="text-zinc-100 font-medium truncate">{actor.name}</p>
      </div>
    </motion.div>
  );
};

export default ActorCard;
