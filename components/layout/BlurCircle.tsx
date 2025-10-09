const BlurCircle = ({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
}) => {
  return (
    <div
      className="absolute -z-10 h-60 w-60 rounded-full bg-primary/30 blur-3xl"
      style={{ top, left, right, bottom }}
    />
  );
};

export default BlurCircle