import { ComponentPropsWithoutRef, forwardRef } from "react";
interface TextEditorProps extends ComponentPropsWithoutRef<"textarea"> {
  value: string;
}

const TextEditor = forwardRef<HTMLTextAreaElement, TextEditorProps>(
  (
    {
      value,
      className,
      maxLength = 300,
      placeholder = "상대방이 나에 대해 더 잘 알 수 있게 말로 풀어내듯, 편안하게 작성해 주세요.😄",
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={`
            p-5 
            flex flex-col gap-1
            w-[362px] h-[178px]
            bg-white
            border-[1px] border-[#DEE3E5]
            rounded-[14px]
            ${className}      
      `}
      >
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`
            flex-1
            bg-transparent     
            border-none        
            outline-none       
            ring-0             
            resize-none
            text-[#202020] text-[16px] font-medium
            placeholder:text-[#A6AFB6]

            [&::-webkit-scrollbar]:display-none
            [ms-overflow-style:none]
            [scrollbar-width:none]
          `}
          {...props}
        />

        <div
          className="
            flex justify-end
            text-[14px] font-medium text-[#A6AFB6]"
        >
          {value.length}/{maxLength}
        </div>
      </div>
    );
  },
);

TextEditor.displayName = "TextEditor";

export { TextEditor };
