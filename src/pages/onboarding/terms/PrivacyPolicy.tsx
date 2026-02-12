import TermsLayout from "./TermsLayout";

export default function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <TermsLayout title="개인정보 처리방침" onBack={onBack}>
      <div className="text-[#333]">
        <p className="mb-3 text-sm leading-relaxed tracking-tight text-[#555]">
          이음(音)(이하 “회사”라 한다)은 「개인정보 보호법」 등 관련 법령을
          준수하며, 이용자의 개인정보와 음성 데이터를 안전하게 보호하고 권익을
          보장하기 위하여 다음과 같은 개인정보처리방침을 수립·공개합니다.
          <br />본 방침은 회사가 제공하는 모든 서비스에 적용됩니다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          1. 개인정보의 처리 목적
        </h2>
        <p className="mb-2 text-sm tracking-tight text-[#555]">
          회사는 다음의 목적을 위하여 개인정보를 처리하며, 명시된 목적 이외의
          용도로는 이용하지 않습니다.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>회원 가입 및 이용자 식별, 본인 확인</li>
          <li>음성 기반 프로필 등록 및 이상형 매칭 서비스 제공</li>
          <li>음성 메시지 대화 및 서비스 운영</li>
          <li>서비스 이용 이력 관리 및 고객 문의 대응</li>
          <li>서비스 개선 및 품질 관리</li>
        </ul>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          2. 개인정보의 처리 및 보유 기간
        </h2>
        <p className="mb-3 text-sm leading-relaxed tracking-tight text-[#555]">
          회사는 개인정보 수집 시 이용자로부터 동의받은 보유·이용 기간 또는 관계
          법령에 따른 보유 기간 내에서 개인정보를 처리·보유합니다.
          <br />
          원칙적으로 개인정보의 처리 목적이 달성된 경우에는 지체 없이
          파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간
          동안 보관합니다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          3. 정보주체의 권리 및 행사 방법
        </h2>
        <p className="mb-2 text-sm tracking-tight text-[#555]">
          이용자는 회사에 대해 언제든지 다음 각 호의 권리를 행사할 수 있습니다.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>개인정보 열람 요구</li>
          <li>개인정보 정정 요구</li>
          <li>개인정보 삭제 요구</li>
          <li>개인정보 처리 정지 요구</li>
        </ul>
        <p className="mt-2 text-sm tracking-tight text-[#555]">
          위 권리는 서비스 내 설정 또는 개인정보 보호책임자에게 이메일을 통해
          행사할 수 있으며, 회사는 지체 없이 조치합니다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          4. 처리하는 개인정보 항목
        </h2>
        <p className="mb-2 text-sm tracking-tight text-[#555]">
          회사는 다음과 같은 개인정보를 처리합니다.
        </p>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          1) 회원 가입 및 기본 서비스 이용 시
        </h3>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            <strong>필수 항목:</strong> 닉네임, 연령대, 거주 지역(시·도 단위)
          </li>
          <li>
            <strong>선택 항목:</strong> 프로필 사진
          </li>
          <li>
            <strong>수집 목적:</strong> 회원 관리 및 매칭 서비스 제공
          </li>
          <li>
            <strong>보유 기간:</strong> 회원 탈퇴 시 또는 동의 철회 시 즉시 파기
          </li>
        </ul>

        <h3 className="mb-2 mt-6 text-[15px] font-bold text-[#333]">
          2) 음성 기반 서비스 이용 시
        </h3>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            <strong>수집 항목:</strong>
            <br />
            - 음성 녹음 파일
            <br />
            - 음성에서 변환된 텍스트(STT)
            <br />- 음성 기반 키워드(성향·취향 요약 정보)
          </li>
          <li>
            <strong>수집 목적:</strong> 이상형 분석 및 매칭 추천, 음성 메시지
            대화 기능 제공
          </li>
          <li>
            <strong>보유 기간:</strong>
            <br />
            - 음성 원본 파일: 서비스 목적 달성 후 또는 일정 기간 경과 시 자동
            삭제
            <br />- 분석 결과 데이터: 회원 탈퇴 시 즉시 파기
          </li>
        </ul>
        <div className="mt-3 rounded bg-[#f9f9f9] p-2.5 text-[13px] text-[#777]">
          ※ 회사는 음성 데이터를 감정 판단, 성격 단정, 의료·건강 진단 등 민감한
          판단 목적으로 사용하지 않습니다.
        </div>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          5. 개인정보의 파기 절차 및 방법
        </h2>
        <div className="mb-3 text-sm tracking-tight text-[#555]">
          <strong className="text-[#333]">파기 절차</strong>
          <br />
          목적이 달성된 개인정보는 별도의 저장소로 이동 후 내부 방침 및 법령에
          따라 파기됩니다.
        </div>
        <div className="mb-3 text-sm tracking-tight text-[#555]">
          <strong className="text-[#333]">파기 기한</strong>
          <br />
          - 보유 기간 경과 시: 종료일로부터 5일 이내
          <br />- 처리 목적 달성 시: 달성일로부터 5일 이내
        </div>
        <div className="text-sm tracking-tight text-[#555]">
          <strong className="text-[#333]">파기 방법</strong>
          <br />
          - 전자적 파일: 복구 불가능한 방법으로 영구 삭제
          <br />- 출력물: 분쇄 또는 소각
        </div>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          6. 개인정보 자동 수집 장치의 설치·운영 및 거부
        </h2>
        <p className="mb-3 text-sm leading-relaxed tracking-tight text-[#555]">
          회사는 서비스 품질 개선을 위해 쿠키(cookie)를 사용할 수 있습니다.
          쿠키는 이용자의 접속 환경을 저장하는 소량의 정보입니다.
          <br />
          이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 이 경우
          일부 맞춤형 서비스 이용에 제한이 있을 수 있습니다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          7. 개인정보 보호책임자
        </h2>
        <p className="mb-2 text-sm tracking-tight text-[#555]">
          회사는 개인정보 보호에 관한 업무를 총괄하여 다음과 같이 책임자를
          지정합니다.
        </p>
        <ul className="list-none space-y-1 text-sm tracking-tight text-[#555]">
          <li>
            <strong>성명:</strong> 안선우
          </li>
          <li>
            <strong>직책:</strong> 서비스 운영 책임자
          </li>
          <li>
            <strong>이메일:</strong> (추후 기입 가능)
          </li>
        </ul>
        <p className="mt-2 text-sm tracking-tight text-[#555]">
          이용자는 개인정보 보호 관련 문의, 불만, 피해구제에 대해 개인정보
          보호책임자에게 문의할 수 있습니다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          8. 개인정보처리방침의 변경
        </h2>
        <p className="mb-3 text-sm tracking-tight text-[#555]">
          본 개인정보처리방침은 시행일로부터 적용되며, 법령 또는 내부 정책 변경
          시 최소 7일 전 서비스 내 공지사항을 통해 안내합니다.
        </p>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          9. 개인정보의 안전성 확보 조치
        </h2>
        <p className="mb-2 text-sm tracking-tight text-[#555]">
          회사는 「개인정보 보호법」 제29조에 따라 다음과 같은 조치를
          시행합니다.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm tracking-tight text-[#555]">
          <li>개인정보 접근 권한의 최소화</li>
          <li>개인정보 취급자 대상 정기 교육</li>
          <li>개인정보 암호화 및 전송 구간 보호</li>
          <li>접속 기록 보관 및 위·변조 방지</li>
          <li>보안 시스템을 통한 외부 침입 차단</li>
        </ul>

        <h2 className="mb-4 mt-10 text-lg font-extrabold text-[#222]">
          10. 정보주체의 권익침해에 대한 구제방법
        </h2>
        <p className="mb-3 text-sm tracking-tight text-[#555]">
          이용자는 아래 기관을 통해 개인정보 침해에 대한 상담 및 피해구제를
          신청할 수 있습니다.
        </p>
        <div className="space-y-3 text-sm leading-relaxed tracking-tight text-[#555]">
          <p>
            <strong className="text-[#333]">
              개인정보 침해신고센터 (KISA)
            </strong>
            <br />
            홈페이지: https://privacy.kisa.or.kr
            <br />
            전화: 118
          </p>
          <p>
            <strong className="text-[#333]">개인정보 분쟁조정위원회</strong>
            <br />
            홈페이지: https://www.kopico.go.kr
            <br />
            전화: 1833-6972
          </p>
          <p>
            <strong className="text-[#333]">대검찰청 사이버범죄수사단</strong>
            <br />
            전화: 02-3480-3573
          </p>
          <p>
            <strong className="text-[#333]">경찰청 사이버범죄 신고</strong>
            <br />
            전화: 182
          </p>
        </div>

        <div className="h-10" />
      </div>
    </TermsLayout>
  );
}
