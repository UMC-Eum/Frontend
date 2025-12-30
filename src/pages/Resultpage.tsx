import BackButton from "../components/BackButton";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMatchResults } from "../mockFetch";
import LikeChatButtonGroup from "../components/LikeChatButtonGroup";

const ResultPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["matchResults"],
    queryFn: fetchAllMatchResults,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;

  return (
    <div className="px-[20px]">
      <div className="mt-[5px]">
        <BackButton />
      </div>

      <div className="h-[28px]" />

      <h1 className="h-[100px] text-[24px] font-[700] leading-[140%] text-[#202020]">
        말씀해주신 내용을 바탕으로
        <br />
        이런 분들을 추천해드릴게요
      </h1>

      <h3 className="mt-[40px] text-[18px] font-[500] text-gray-700">
        ~~님의 이상형은...
      </h3>

      <div className="flex flex-col gap-4 items-center">
        {" "}
        {data?.map((item) => (
          <div
            key={item.id}
            className="w-full max-w-[362px] h-[522px] border rounded-[14px] bg-white"
          >
            {item.name}
            <LikeChatButtonGroup />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultPage;
