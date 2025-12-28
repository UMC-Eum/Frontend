import BackButton from "../components/BackButton";

const ResultPage = () => {
  return (
    <div>
      <div className="mt-[5px]">
        <BackButton />
      </div>

      {/* ✅ 고정 간격 28px */}
      <div className="h-[28px]" />

      <h1 className="h-[100px] text-[24px] font-[700] leading-[140%] text-[#202020]">
        말씀해주신 내용을 바탕으로
        <br />
        이런 분들을 추천해드릴게요
      </h1>
      <h3 className="mt-[40px] font-[18px] font-500 text-gray-700">
        ~~님의 이상형은...
      </h3>
    </div>
  );
};

export default ResultPage;
