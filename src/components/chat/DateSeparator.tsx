export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex justify-center my-4">
      <div className="text-[#636970] text-[14px] px-3 py-1">
        {date}
      </div>
    </div>
  );
}