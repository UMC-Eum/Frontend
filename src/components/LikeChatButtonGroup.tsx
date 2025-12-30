const LikeChatButtonGroup = () => {
  return (
    <div className="flex flex-row gap-[12px]">
      <button className="flex items-center justify-center w-[155px] h-[52px] border rounded-[14px] px-[36px] py-[17px] font-[500] text-[16px] whitespace-nowrap">
        마음에 들어요
      </button>
      <button className="flex items-center justify-center w-[155px] h-[52px] border rounded-[14px] px-[36px] py-[17px] font-[500] text-[16px] whitespace-nowrap">
        바로 대화해보기
      </button>
    </div>
  );
};

export default LikeChatButtonGroup;
