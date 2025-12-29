import BackButton from "../components/BackButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMatchResults } from "../mockFetch";
import { useMemo, useRef, useEffect } from "react";
import { throttle } from "../hooks/throttle";
import { useOutletContext } from "react-router-dom";
const ResultPage = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["matchResults"],
      queryFn: fetchMatchResults,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const throttledFetchNext = useMemo(
    () =>
      throttle(() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }, 1000),
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          throttledFetchNext();
        }
      },
      {
        root: scrollRef.current,
        threshold: 0,
        rootMargin: "100px",
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [throttledFetchNext, hasNextPage, isFetchingNextPage]);

  const { scrollRef } = useOutletContext<{
    scrollRef: React.RefObject<HTMLDivElement>;
  }>();

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
      {data?.pages
        .flatMap((page) => page.items)
        .map((item) => (
          <div key={item.id} className="border p-4 rounded-xl">
            {item.name}
          </div>
        ))}
      <div ref={loaderRef} className="h-[80px]" />
    </div>
  );
};

export default ResultPage;
