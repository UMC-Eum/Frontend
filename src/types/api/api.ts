// 1. 공통으로 들어가는 메타 정보
interface ApiMeta {
  timestamp: string;
  path: string;
}

// 2. 에러가 났을 때 오는 정보 구조
export interface ApiErrorDetail {
  code: string;
  message: string;
}

// 3. 성공했을 때 오는 응답 구조 (제네릭 T 사용!)
export interface ApiSuccessResponse<T> {
  resultType: "SUCCESS";
  success: {
    data: T;
  };
  error: null;
  meta: ApiMeta;
}

// 4. 실패했을 때 오는 응답 구조
export interface ApiFailResponse {
  resultType: "FAIL";
  success: null;
  error: ApiErrorDetail;
  meta: ApiMeta;
}
