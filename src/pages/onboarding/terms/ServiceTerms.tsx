import TermsLayout from "./TermsLayout";

export default function ServiceTerms({ onBack }: { onBack: () => void }) {
  return (
    <TermsLayout title="서비스 이용약관" onBack={onBack}>
      <div className="text-[#333]">
        <h2 className="mb-4 mt-6 text-lg font-extrabold text-[#222]">
          제 1 장 총칙
        </h2>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 1 조 (목적)
        </h3>
        <p className="mb-3 text-sm leading-relaxed tracking-tight text-[#555]">
          본 약관은 이음(音)(이하 “회사”라 한다)가 제공하는 음성 기반 매칭 및
          커뮤니케이션 서비스(이하 “서비스”)의 이용과 관련하여 회사와 이용자
          간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로
          한다.
        </p>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 2 조 (용어의 정의)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            “서비스”란 회사가 제공하는 음성 기반 프로필 등록, 이상형 매칭, 음성
            메시지 대화, 추천 기능 등 이와 관련된 제반 서비스를 의미한다.
          </li>
          <li>
            “이용자”란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을
            말한다.
          </li>
          <li>
            “회원”이란 서비스 이용을 위해 본 약관 및 개인정보처리방침에 동의하고
            회원가입을 완료한 자를 말한다.
          </li>
          <li>
            “아이디(ID)”란 회원 식별과 서비스 이용을 위해 회원이 설정한 닉네임을
            의미한다.
          </li>
          <li>
            “음성 데이터”란 이용자가 서비스 이용 과정에서 녹음·전송하는 음성
            파일 및 해당 음성을 변환·분석하여 생성된 텍스트, 키워드 등 파생
            정보를 의미한다.
          </li>
          <li>
            “매칭”이란 이용자의 음성 정보 및 선호 정보를 바탕으로 다른 이용자를
            추천하는 과정을 의미한다.
          </li>
        </ol>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 3 조 (약관의 게시 및 변경)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            본 약관은 서비스 초기 화면 또는 회원가입 화면에 게시하여 이용자가
            확인할 수 있도록 한다.
          </li>
          <li>
            회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수
            있으며, 변경 시 적용일자 및 변경 내용을 서비스 내 공지사항을 통해
            사전에 공지한다.
          </li>
          <li>변경된 약관은 공지한 적용일로부터 효력이 발생한다.</li>
        </ol>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 4 조 (약관 외 준칙)
        </h3>
        <p className="mb-3 text-sm leading-relaxed tracking-tight text-[#555]">
          본 약관에 명시되지 않은 사항은 「전자상거래 등에서의 소비자 보호에
          관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」,
          「개인정보 보호법」 등 관계 법령 및 회사가 정한 운영 정책에 따른다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          제 2 장 이용계약
        </h2>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 5 조 (이용신청)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            이용자는 회원가입 화면에서 본 약관과 개인정보처리방침에 동의함으로써
            이용신청을 할 수 있다.
          </li>
          <li>
            서비스는 만 50세 이상 이용자를 주요 대상으로 설계되었으며, 회사는
            서비스 특성상 연령 확인을 요청할 수 있다.
          </li>
        </ol>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 6 조 (이용신청의 승낙)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>회사는 원칙적으로 이용신청을 승낙한다.</li>
          <li>
            다만, 다음 각 호에 해당하는 경우 승낙을 거절하거나 유보할 수 있다.
          </li>
        </ol>
        <ul className="ml-5 mt-1 list-disc space-y-1 pl-5 text-sm tracking-tight text-[#555]">
          <li>타인의 정보를 도용하여 신청한 경우</li>
          <li>허위 정보를 기재한 경우</li>
          <li>서비스의 취지에 부합하지 않는 목적의 이용이 명백한 경우</li>
          <li>기술적 장애 또는 운영상 불가피한 사유가 있는 경우</li>
        </ul>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          제 3 장 계약 당사자의 의무
        </h2>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 7 조 (회사의 의무)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            회사는 관련 법령과 본 약관이 정하는 바에 따라 서비스를 안정적으로
            제공하도록 노력한다.
          </li>
          <li>
            회사는 이용자의 음성 데이터를 민감 정보에 준하는 수준으로 보호하며,
            개인정보처리방침에 따라 안전하게 관리한다.
          </li>
          <li>회사는 이용자의 정당한 의견이나 불만을 성실히 처리한다.</li>
        </ol>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 8 조 (이용자의 의무)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>이용자는 본 약관 및 서비스 운영 정책을 준수해야 한다.</li>
          <li>이용자는 다음 행위를 하여서는 안 된다.</li>
        </ol>
        <ul className="ml-5 mt-1 list-disc space-y-1 pl-5 text-sm tracking-tight text-[#555]">
          <li>타인의 음성, 사진, 개인정보를 무단으로 수집·유포하는 행위</li>
          <li>상대방에게 불쾌감, 위협, 혐오감을 주는 행위</li>
          <li>영리 목적의 홍보, 광고, 사기 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
        </ul>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          제 4 장 서비스 이용
        </h2>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 9 조 (서비스 내용)
        </h3>
        <p className="mb-2 text-sm text-[#555]">
          회사는 다음과 같은 서비스를 제공한다.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>음성 기반 프로필 및 이상형 등록</li>
          <li>음성 데이터 분석을 통한 매칭 추천</li>
          <li>음성 메시지 기반 대화 기능</li>
          <li>기타 회사가 추가 개발하거나 제공하는 기능</li>
        </ul>
        <p className="mt-2 text-sm text-[#555]">
          서비스 내용은 회사의 정책에 따라 변경될 수 있다.
        </p>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 10 조 (음성 데이터의 처리)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            이용자의 음성 데이터는 서비스 제공 및 매칭 기능을 위해서만 사용된다.
          </li>
          <li>
            회사는 음성 원본 파일을 필요 최소 기간 보관 후 자동 삭제할 수 있다.
          </li>
          <li>
            회사는 음성 데이터를 감정 판단, 성격 단정 등 과도한 분석에 사용하지
            않는다.
          </li>
        </ol>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 11 조 (서비스 이용 제한)
        </h3>
        <p className="mb-2 text-sm text-[#555]">
          회사는 다음 각 호에 해당하는 경우 이용자의 서비스 이용을 제한할 수
          있다.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>타 이용자에게 지속적인 불쾌감 또는 피해를 주는 경우</li>
          <li>신고가 누적되어 서비스 신뢰를 저해하는 경우</li>
          <li>관계 법령을 위반한 경우</li>
        </ul>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 12 조 (서비스 중단)
        </h3>
        <p className="mb-2 text-sm text-[#555]">
          회사는 다음 각 호의 사유가 발생한 경우 서비스 제공을 일시 중단할 수
          있다.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>시스템 점검 또는 보수</li>
          <li>천재지변, 통신 장애 등 불가항력적 사유</li>
        </ul>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          제 5 장 유료 서비스
        </h2>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 13 조 (유료 서비스 및 결제)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>회사는 일부 기능에 대해 유료 서비스를 제공할 수 있다.</li>
          <li>유료 서비스의 내용, 요금, 결제 방식은 별도로 안내한다.</li>
          <li>결제 후 환불은 관련 법령 및 회사의 환불 정책에 따른다.</li>
        </ol>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          제 6 장 기타
        </h2>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 14 조 (면책)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            회사는 이용자 간의 만남, 대화, 관계 형성에 직접 관여하지 않는다.
          </li>
          <li>회사는 이용자 간 발생한 분쟁에 대해 책임을 지지 않는다.</li>
        </ol>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          제 15 조 (분쟁 해결)
        </h3>
        <ol className="ml-5 list-decimal space-y-1 text-sm tracking-tight text-[#555]">
          <li>회사와 이용자는 분쟁 발생 시 원만한 해결을 위해 노력한다.</li>
          <li>
            분쟁으로 인한 소송은 회사의 본점 소재지를 관할하는 법원을 관할
            법원으로 한다.
          </li>
        </ol>

        <div className="h-10" />
      </div>
    </TermsLayout>
  );
}
