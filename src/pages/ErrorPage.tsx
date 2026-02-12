import { useNavigate, useRouteError } from "react-router-dom";
import { ApiErrorDetail } from "../types/api/api";
import { HalfButton } from "../components/standard/CTA";
import ErrorIcon from "../assets/ErrorIcon.svg";
import { ERROR_SITUATION_MAP } from "../constants/errorConstants";

interface ErrorPageProps {
    error?: ApiErrorDetail;
}   

export default function ErrorPage({ error: propError }: ErrorPageProps) {
    const navigate = useNavigate();
    const routeError = useRouteError() as any;

    // 에러 객체 결정 로직
    let error: ApiErrorDetail;

    if (propError) {
        error = propError;
    } else if (routeError?.data?.code) {
        // 서버에서 보낸 커스텀 에러 (ApiErrorDetail 구조)
        error = routeError.data;
    } else if (routeError?.status === 404) {
        // 리액트 라우터 404
        error = {
            code: "NOT_FOUND",
            message: "요청하신 페이지를 찾을 수 없습니다."
        };
    } else {
        // 그 외 알 수 없는 에러
        error = {
            code: "UNKNOWN",
            message: routeError?.statusText || routeError?.message || "알 수 없는 오류가 발생했습니다."
        };
    }

    const sentences = error.message ? error.message.split('.').filter(s => s.trim() !== '') : [];    

    // 맵에 없는 코드일 경우 대비
    const errorTitle = ERROR_SITUATION_MAP[error.code] || "오류 발생";

    return (
        <div className="
            fixed inset-0 z-50 
            flex items-center justify-center
            bg-white"> 
            <div className="flex flex-col items-center text-center">
                <img src={ErrorIcon} alt="Error Icon" />
                <div className="mt-10 flex flex-col items-center gap-3">
                    <h1 className="text-[20px] font-semibold text-[#636970]">
                        {error.code}: {errorTitle}
                    </h1>
                    <p className="text-[18px] font-medium text-[#A6AFB6] leading-[1.2] break-keep">
                        {sentences.map((sentence, index) => (
                            <span key={index} className="block">
                                {sentence.trim()}
                            </span>
                        ))}
                    </p>                
                </div>
                <HalfButton
                    className="mt-6"
                    onClick={() => navigate("/")}
                >
                    홈으로 이동 
                </HalfButton>
            </div>
        </div>
    );
}
