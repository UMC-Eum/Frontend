// src/hooks/chat/useChatScroll.ts
import { useEffect, useRef, useLayoutEffect } from "react";

interface UseChatScrollProps {
  isInitLoaded: boolean;
  isLoading: boolean;
  nextCursor: string | null;
  messagesLength: number; // 메시지 배열의 길이 (변화 감지용)
  loadPrevMessages: () => Promise<void>;
}

export function useChatScroll({ 
  isInitLoaded, 
  isLoading, 
  nextCursor, 
  messagesLength,
  loadPrevMessages 
}: UseChatScrollProps) {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // 1. 초기 로딩 완료 시 맨 아래로 이동
  useEffect(() => {
    if (isInitLoaded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [isInitLoaded]);

  // 2. 무한 스크롤 (위로 올렸을 때)
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        // 감시 조건: 맨 위 && 다음장 있음 && 로딩 안 함 && 초기화 끝남
        if (entries[0].isIntersecting && nextCursor && !isLoading && isInitLoaded) {
          if (scrollContainerRef.current) {
            // 🔥 [핵심] 현재 높이 저장 (Scroll Anchoring)
            prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
          }
          await loadPrevMessages();
        }
      },
      { threshold: 0.5 }
    );

    if (topObserverRef.current) observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, isInitLoaded, loadPrevMessages]);

  // 3. 메시지 로드 후 스크롤 위치 복구 (깜빡임 방지)
  useLayoutEffect(() => {
    if (isLoading) return;
    if (scrollContainerRef.current && prevScrollHeightRef.current > 0) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = currentScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messagesLength, isLoading]); // 메시지 개수가 변했을 때 실행

  return { scrollContainerRef, topObserverRef, bottomRef };
}