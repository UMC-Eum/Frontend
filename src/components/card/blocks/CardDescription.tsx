// card/blocks/CardDescription.tsx
export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm mb-3 truncate">{children}</p>;
}

