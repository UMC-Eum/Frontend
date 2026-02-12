import { ComponentPropsWithoutRef, forwardRef } from 'react';

/******************************
 * TextEditor
 * *****************************/

//가로 : 362px
//세로 : 178px

// textarea의 기본 속성들을 모두 상속
interface TextEditorProps extends ComponentPropsWithoutRef<'textarea'> {
  value: string;
}

const TextEditor = forwardRef<HTMLTextAreaElement, TextEditorProps>(
  ({ value, className, maxLength=300, 
    placeholder="상대방이 나에 대해 더 잘 알 수 있게 말로 풀어내듯, 편안하게 작성해 주세요.😄",
    ...props }, ref) => {
    return (
      <div className={`
            p-5 
            flex flex-col gap-1
            w-[362px] h-[178px]
            bg-white
            border-[1px] border-[#DEE3E5]
            rounded-[14px]
            ${className}      
      `}>
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          /* 스크롤바 제거 */
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
        
        {/* 글자수 표시부 */}
        <div className="
            flex justify-end
            text-[14px] font-medium text-[#A6AFB6]">
          {value.length}/{maxLength}
        </div>
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';

export { TextEditor };





