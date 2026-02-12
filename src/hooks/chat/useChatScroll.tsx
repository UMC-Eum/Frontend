import { useEffect, useRef, useLayoutEffect, useCallback } from "react";

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
  loadPrevMessages,
  messagesLength, // deps용
}: UseChatScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // 과거 데이터 로딩 전 스크롤 높이 저장용
  const prevScrollHeightRef = useRef<number>(0);
  
  // 사용자가 현재 바닥 근처를 보고 있는지 판단하는 Ref
  const isAtBottomRef = useRef<boolean>(true);

  // ✅ 수동으로 바닥으로 보내는 함수 (외부 노출)
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    bottomRef.current?.scrollIntoView({ behavior });
    isAtBottomRef.current = true;
  }, []);

  // ✅ 스크롤 이벤트 핸들러: 사용자가 스크롤을 올렸는지 감지
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // 바닥에서 100px 이내면 "바닥에 있다"고 판단
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = isBottom;
  }, []);

  // 스크롤 리스너 등록
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ❌ [삭제됨] messagesLength가 변하면 무조건 내리는 useEffect 삭제!
  // 이제 스크롤 제어 권한은 Page 컴포넌트로 넘어갑니다.

  // 1. 무한 스크롤 관찰자 (위로 올렸을 때 과거 메시지 로드)
  useEffect(() => {
    if (!topObserverRef.current || !nextCursor || isLoading || !isInitLoaded) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          if (scrollContainerRef.current) {
            // 로드 직전 높이 저장
            prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
          }
          await loadPrevMessages();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, isInitLoaded, loadPrevMessages]);

  // 2. 과거 메시지 로드 후 스크롤 위치 복구 (Scroll Anchoring)
  useLayoutEffect(() => {
    if (scrollContainerRef.current && prevScrollHeightRef.current > 0) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      const heightDiff = currentScrollHeight - prevScrollHeightRef.current;
      
      // 늘어난 만큼 스크롤을 아래로 조정하여 시각적 위치 유지
      scrollContainerRef.current.scrollTop += heightDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messagesLength]); // 메시지 길이가 변했을 때(과거 로딩 시) 실행

  return { 
    scrollContainerRef, 
    topObserverRef, 
    bottomRef, 
    scrollToBottom, 
    isAtBottomRef 
  };
}