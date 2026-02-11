import { useEffect, useRef, useLayoutEffect } from "react";

interface UseChatScrollProps {
  isInitLoaded: boolean;
  isLoading: boolean;
  nextCursor: string | null;
  messagesLength: number;
  loadPrevMessages: () => Promise<void>;
}

export function useChatScroll({
  isInitLoaded,
  isLoading,
  nextCursor,
  messagesLength,
  loadPrevMessages,
}: UseChatScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // ✅ 1. 초기 로딩 완료 시 & 새 메시지 수신 시 무조건 맨 아래로 이동
  useEffect(() => {
    if (isInitLoaded && bottomRef.current) {
      // 새 메시지가 오면 부드럽게 스크롤 하단으로 이동
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesLength, isInitLoaded]);

  // 2. 무한 스크롤 관찰자 (위로 올렸을 때 과거 메시지 로드)
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (
          entries[0].isIntersecting &&
          nextCursor &&
          !isLoading &&
          isInitLoaded
        ) {
          if (scrollContainerRef.current) {
            // 🔥 과거 데이터 로드 직전 현재 높이 저장 (위치 고정용)
            prevScrollHeightRef.current =
              scrollContainerRef.current.scrollHeight;
          }
          await loadPrevMessages();
        }
      },
      { threshold: 0.5 },
    );

    if (topObserverRef.current) observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, isInitLoaded, loadPrevMessages]);

  // ✅ 3. 과거 메시지 로드 후 스크롤 위치 복구 (Scroll Anchoring)
  useLayoutEffect(() => {
    // 과거 데이터를 가져와서 높이가 변했을 때만 실행
    if (
      !isLoading &&
      scrollContainerRef.current &&
      prevScrollHeightRef.current > 0
    ) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      // 늘어난 높이만큼 스크롤 위치를 아래로 밀어줘서 사용자가 보던 위치 유지
      scrollContainerRef.current.scrollTop =
        currentScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messagesLength, isLoading]);

  return { scrollContainerRef, topObserverRef, bottomRef };
}
