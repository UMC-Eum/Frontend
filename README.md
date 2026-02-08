# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

# 사용 라이브러리 & 선택 이유

## 프레임워크 / 빌드

### React

- 역할 : UI 컴포넌트 기반 SPA 구성
- 선택 이유 : 컴포넌트 분리/재사용이 용이하고 생태계가 크며, 팀 협업 시 구조가 명확함
- 기태 효과 : 빠른 UI 개발, 상태/라우팅/비동기 처리 라이브러리와 결합이 쉬움

### Typescript

- 역할 : 정적 타입 리반 개발
- 선택 이유 : API DTO(요청/응답 타입)처럼 형태가 명확한 데이터가 많을 때 런타임 오류를 줄여줌
- 기대 효과 : 컴파일 단계에서 오류를 조기에 발견, 리팩터링 안정성 증가, 협업 생산성 향상

### Vite

- 역할 : 번들링/개발 서버
- 선택 이유 : 빠른 HMR과 빌드 속도, 설정이 단순
- 기대 효과 : 개발 경험 개선(속도), 프로젝트 규모가 커져도 유지보수 부담 감소

## 라우팅

### react-router-dom

- 역할 : 페이지 라우팅, nested route, state 전달
- 선택 이유 : React SPA에서 표준에 가깝고 문서/사례가 풍부함
- 기대 효과 : 페이지 구조를 선언적으로 관리, 접근 경로/네비게이션 로직 단순화

## UI

### Tailwind CSS

- 역할 : 유틸리티 클래스 기반 스타이링
- 선택 이유 : 모바일 UI처럼 디자인이 촘촘할 때 CSS 파일을 왔다갔다 하지 않고 빠르게 구현 가능
- 기대 효과 : 디자인 일관성 유지, 컴포넌트 단위 개발 속도 향상, 스타일 충돌 감소

## API 통신

### axios

- 역할 : HTTP 요청/응답 처리
- 선택 이유 : 인터셉터로 토큰 주입/401 처리/refresh 로직 구성에 유리함
- 기대 효과 : 인증/에러 처리 공통화, API 모듈화로 유지보수성 향상

### socket.io-client

- 역할 : 실시간 양방향 통신
- 선택 이유 : WebSocket을 쉽게 사용할 수 있고, 서버와 동일한 프로토콜을 사용
- 기대 효과 : 실시간 채팅, 알림 등 실시간 기능 구현 용이

## 서버 상태 관리

### @tanstack/react-query

- 역할 : 서버 데이터 fetching/caching/retry/loading 상태 관리
- 선택 이유 : 캐싱/리페치/페이지네이션에 강함
- 기대 효과 : 불필요한 API 호출 감소, 로딩/에러 처리 표준화, UX 개선

## 전역 상태 관리

### zustand

- 역할 : 전역 UI/사용자 상태 관리
- 선택 이유 : Redux 대비 보일러플레이트가 적고, store 분리가 쉬움
- 기대 효과 : 간단한 전역 상태를 가볍게 관리, 컴포넌트 간 props drilling 감소

## 배포

### Vercel

- 역할 : 프론트엔드 배포 및 자동 빌드
- 선택 이유 : Github 연동이 쉽고 PR 단위 프리뷰가 가능
- 기대 효과 : 배포 자동화, 팀 협업/테스트 속도 향상
