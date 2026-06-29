# EUM Mobile

<p align="center">
  <strong>Expo Router 기반의 EUM 모바일 앱</strong>
</p>

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-54.0-000020?style=flat-square&logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=111111" />
  <img alt="React" src="https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react&logoColor=111111" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
</p>

## Overview

EUM Mobile은 카카오 로그인, 온보딩, 프로필 등록, 추천 프로필, 마음, 채팅, 동호회, 결제 화면을 제공하는 모바일 앱입니다.

Expo Router의 파일 기반 라우팅을 사용하며, 서버 상태는 React Query, 클라이언트 상태는 Zustand, API 통신은 Axios와 Socket.IO 계층으로 관리합니다.

## Tech Stack

| Area | Stack |
| --- | --- |
| App | Expo 54, React Native 0.81, React 19 |
| Language | TypeScript, strict mode |
| Routing | Expo Router |
| Server State | TanStack React Query |
| Client State | Zustand |
| Network | Axios, Socket.IO Client |
| UI | React Native, Expo Vector Icons, Moti |
| Tooling | ESLint, Commitizen, pnpm |

## Features

- 카카오 OAuth 기반 로그인 및 앱 딥링크 처리
- 권한 동의, 약관, 프로필 입력으로 이어지는 온보딩 플로우
- 추천 프로필 카드, 마음 보내기, 프로필 방문 기록
- 받은 마음과 보낸 마음 목록
- 채팅 목록, 채팅방, 신고 플로우
- 동호회 홈, 상세, 생성, 게시글 작성 및 상세
- 이상형 음성 녹음 및 분석 API 연동
- 마이페이지, 프로필 수정, 로그아웃, 회원 탈퇴
- 알림 배지와 마음/동호회 알림 화면

## Getting Started

### Requirements

- Node.js
- pnpm
- iOS Simulator 또는 Android Emulator
- Expo CLI는 `pnpm` 스크립트를 통해 실행

### Installation

```bash
pnpm install
```

### Environment Variables

루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com
EXPO_PUBLIC_KAKAO_REST_API_KEY=your-kakao-rest-api-key
EXPO_PUBLIC_KAKAO_REDIRECT_URI=https://your-kakao-redirect-uri
```

`EXPO_PUBLIC_KAKAO_API_KEY`도 대체 키 이름으로 지원하지만, 새 환경에서는 `EXPO_PUBLIC_KAKAO_REST_API_KEY` 사용을 권장합니다.

### Run

```bash
pnpm start
```

```bash
pnpm ios
pnpm android
pnpm web
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm start` | Expo 개발 서버 실행 |
| `pnpm ios` | iOS 네이티브 앱 실행 |
| `pnpm android` | Android 네이티브 앱 실행 |
| `pnpm web` | Web 타깃으로 실행 |
| `pnpm lint` | Expo ESLint 실행 |
| `pnpm commit` | Commitizen으로 커밋 메시지 작성 |
| `pnpm reset-project` | Expo starter reset 스크립트 실행 |

## Project Structure

```text
.
├── app/                  # Expo Router routes
│   ├── onboarding/       # 로그인 이후 온보딩 화면
│   ├── auth/             # 카카오 인증 콜백
│   ├── profile/          # 프로필 생성/수정 플로우
│   ├── club/             # 동호회 화면
│   ├── chat/             # 채팅 화면
│   └── (tabs)/           # 마음, 채팅, 마이페이지 탭
├── api/                  # Axios API client and domain APIs
├── components/           # Shared UI components
├── hooks/                # API hooks and shared hooks
├── stores/               # Zustand stores
├── constants/            # Auth, location, search, theme constants
├── types/                # Shared TypeScript types
├── assets/               # App icons and image assets
└── scripts/              # Project scripts
```

## Routing Map

| Route | Purpose |
| --- | --- |
| `/` | 인증 상태에 따라 진입 화면 리다이렉트 |
| `/auth` | 인증 진입점 |
| `/auth/kakao` | 카카오 로그인 콜백 |
| `/onboarding/*` | 스플래시, 권한, 약관, 로그인 |
| `/profile/*` | 이름, 성별, 나이, 지역, 사진, 환영 화면 |
| `/home` | 추천 프로필과 홈 피드 |
| `/(tabs)/heart` | 받은 마음/보낸 마음 |
| `/(tabs)/chat` | 채팅 목록 |
| `/(tabs)/my` | 마이페이지 |
| `/club/*` | 동호회 홈, 상세, 생성, 게시글 |
| `/chat/[id]` | 채팅방 |
| `/search` | 검색 |
| `/ideal-recording` | 이상형 음성 녹음 |
| `/payment` | 결제 |

## API Layer

- `api/axiosInstance.ts`에서 공통 Axios 인스턴스를 생성합니다.
- `EXPO_PUBLIC_API_BASE_URL`을 base URL로 사용합니다.
- 요청 시 Zustand auth store의 access token을 `Authorization` 헤더에 주입합니다.
- `AUTH-002` 401 응답은 token refresh 요청 후 원 요청을 재시도합니다.
- 채팅 실시간 이벤트는 `api/chats/chatSocketApi.ts`의 Socket.IO client에서 관리합니다.

## Development Notes

- TypeScript는 `strict` 모드로 동작합니다.
- `@/*` alias는 프로젝트 루트를 가리킵니다.
- `.npmrc`는 `node-linker=hoisted`로 설정되어 있습니다.
- `my-expo-app/`은 현재 루트 `tsconfig.json`의 검사 대상에서 제외되어 있습니다.
- Expo scheme은 `eummobile`입니다.

## Quality Checklist

커밋 전 아래 항목을 확인합니다.

```bash
pnpm lint
```

- 새 화면을 추가했다면 `app/` 라우트와 네비게이션 진입점을 함께 확인합니다.
- API 연동을 추가했다면 `api/`, `hooks/api/`, `hooks/api/queryKeys.ts`의 책임을 분리합니다.
- 인증이 필요한 요청은 공통 Axios 인스턴스를 사용합니다.
- 환경변수나 민감정보는 README 예시값만 남기고 실제 값은 커밋하지 않습니다.
