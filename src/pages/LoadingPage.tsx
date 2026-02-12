export default function LoadingPage() {
  return (
    <div
      className="
        fixed inset-0 z-50 
        flex items-center justify-center
        bg-white"
    >
      <div className="flex flex-col items-center">
        <div
          className="relative w-[98px] h-[98px] animate-spin"
          style={{ animationDirection: "reverse" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #FC3367 0deg, #FD5966 83.08deg, rgba(255, 153, 98, 0.6) 147.12deg, rgba(255, 255, 255, 0) 360deg)",
              WebkitMaskImage: "radial-gradient(transparent 39px, black 40px)",
              maskImage: "radial-gradient(transparent 39px, black 40px)",
            }}
          />

          <div
            className="absolute w-[9px] h-[9px] rounded-full bg-[#FC3367]"
            style={{
              left: "50%",
              bottom: "0",
              transform: "translateX(-50%)",
            }}
          />
        </div>

        <p className="mt-[39px] text-[18px] font-semibold text-[#4B5563] tracking-tight">
          잠시만 기다려주세요...
        </p>
      </div>
    </div>
  );
}
