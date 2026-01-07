const MOCK_RESULT_DATA = {
  matchingId: 123,

  nickname: "개발하는 튜브",

  description: "조용하고 차분한 스타일을 선호하시는군요!",

  keywords: ["차분함", "지적임", "안경"],
};

export const mockAnalyzeVoice = (): Promise<typeof MOCK_RESULT_DATA> => {
  return new Promise((resolve) => {
    console.log("📡 (가짜) 서버로 목소리 전송 중...");

    setTimeout(() => {
      console.log("✅ (가짜) 분석 완료!");

      resolve(MOCK_RESULT_DATA);
    }, 2000); // 2초 딜레이
  });
};
