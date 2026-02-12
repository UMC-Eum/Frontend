export function CardDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm mb-3 text-white leading-relaxed font-medium">
      {children}
    </p>
  );
}
