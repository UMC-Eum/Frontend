function ChatRoomItemSkeleton() {
  return (
    <div className="px-5 py-[18px] flex items-center w-full h-[112px] bg-white border-[1.5px] border-[#E9ECED] gap-5 animate-pulse">
      <div className="shrink-0 w-[76px] h-[76px] bg-gray-200 rounded-full" />

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-12 bg-gray-200 rounded-md" />
          <div className="h-4 w-24 bg-gray-200 rounded-md" />
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

function AlarmItemSkeleton() {
  return (
    <div className="pl-5 pr-[18px] py-5 flex items-center w-full h-[111px] bg-white border-b-[1px] border-[#E9ECED] gap-[17px] animate-pulse">
      <div className="shrink-0 w-[62px] h-[62px] bg-gray-200 rounded-full" />

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between h-4">
          <div className="w-16 bg-gray-200 rounded-md" />
          <div className="w-12 bg-gray-200 rounded-md" />
        </div>
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="h-4 w-full bg-gray-200 rounded-md" />
          <div className="h-4 w-2/3 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { ChatRoomItemSkeleton, AlarmItemSkeleton };
