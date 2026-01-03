import { useState } from "react"
import { TermType } from "../types"
import allcheckbutton from "../../../assets/term_allcheckbutton.svg"
import checkbutton from "../../../assets/term_checkbutton.svg"
import detailbutton from "../../../assets/term_detailbutton.svg"

interface Term {
  type: TermType
  title: string
  required: boolean
}

interface Props {
  terms: Term[]
  checked: Record<TermType, boolean>
  onToggle: (type: TermType) => void
  onToggleAll: () => void
  onConfirm: () => void
  onOpenTerm: (type: TermType) => void
}

export default function AgreementSheet({
  terms,
  checked,
  onToggle,
  onToggleAll,
  onConfirm,
  onOpenTerm,
}: Props) {

  const [error, setError] = useState("")

  const handleConfirm = () => {
  const invalid = terms.some(
    (t) => t.required && !checked[t.type]
  )

  if (invalid) {
    setError("필수 약관에 모두 동의해주세요.")
    return
  }

  setError("")
  onConfirm()
}


  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-[20px] p-6">
        <div className="text-2xl font-semibold mb-6">
          서비스 이용을 위해
          <br /> 
          약관 동의가 필요합니다.
        </div>

        {terms.map((term) => (
          <div key={term.type} className="flex justify-between mb-4">
            <div
              className="flex gap-2 cursor-pointer"
              onClick={() => onToggle(term.type)}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <img 
                  src={checkbutton}
                  className={`
                    w-5 h-5
                    ${checked[term.type] ? "brightness-0" : "opacity-40"}
                  `}
                />
  <span>{term.title}</span>
</div>

            </div>

            <img
              src={detailbutton}
              onClick={() => onOpenTerm(term.type)}/>
          </div>
        ))}

        <div
          onClick={onToggleAll}
          className="flex items-center gap-2 text-[20px] font-semibold mb-4 cursor-pointer"
        >
          <img
            src={allcheckbutton}
            className={`
              w-6 h-6
              ${Object.values(checked).every(Boolean)
                ? "brightness-0" : "opacity-40"}
            `}
          />
          <span>모든 이용약관에 동의합니다.</span>
        </div>


        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleConfirm}
          className="text-[18px] w-full h-14 mb-10 bg-[#fc3367] text-white rounded-2xl"
        >
          확인
        </button>
      </div>
    </div>
  )
}
