interface Props {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export default function TermsLayout({ title, onBack, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="h-14 flex items-center px-4 border-b">
        <button onClick={onBack} className="mr-2 p-2 text-xl">←</button>
        <h1 className="font-bold text-lg">{title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
