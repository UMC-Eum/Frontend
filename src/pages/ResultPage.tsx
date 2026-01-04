import { useQuery } from "@tanstack/react-query";
import { fetchAllMatchResults } from "../mock/mockFetch";

const ResultPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["matchResults"],
    queryFn: fetchAllMatchResults,
  });

  if (isLoading) return <div className="p-5">로딩 중...</div>;
  if (isError) return <div className="p-5">에러가 발생했습니다.</div>;

  return (
    <div className="px-[20px] pb-[40px]">
      <h1 className="mt-[28px] text-[24px] font-[700] leading-[140%] text-[#202020]">
        말씀해주신 내용을 바탕으로
        <br />
        이런 분들을 추천해드릴게요
      </h1>

      <div className="mt-[40px]">
        <h3 className="text-[18px] font-[500] text-[#707070]">
          ~~님의 이상형은...
        </h3>

        <div className="mt-[12px] h-[96px] flex items-center bg-gray-50 rounded-[10px]">
          <span className="text-gray-400 ml-2">
            이상형 키워드들 (h-96 영역)
          </span>
        </div>
      </div>

      <div className="mt-[24px] flex flex-col gap-y-[20px] items-center">
        {data?.map((item) => (
          <div
            key={item.id}
            className="relative w-full max-w-[362px] h-[522px] border rounded-[14px] bg-white overflow-hidden"
          >
            <div className="p-4">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultPage;
