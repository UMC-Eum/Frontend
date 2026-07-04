---
name: eum-figma-rn-ui
description: Use this skill when implementing or modifying Expo React Native UI from Figma frames, Figma links, screenshots, or Figma MCP data for the EUM frontend project. Use only for UI work, not API/business logic/refactors.
---

# EUM Figma → React Native UI

Figma 디자인을 Expo Router 기반 React Native UI로 구현한다. 픽셀 복사가 아니라 기존 프로젝트 구조, 공용 컴포넌트, StyleSheet 패턴에 맞게 변환한다.

## Start

- 바로 구현하지 말고 요청받은 Figma node/frame 중심으로만 확인한다. 다른 화면은 무시한다.
- 구현 전 짧게 정리한다: 화면 목적, 컴포넌트 트리, 재사용 가능한 기존 컴포넌트, 변경 파일, 확인 필요사항.
- 작업 전 `git status`와 관련 route/component를 확인한다.

## Reuse First

- 새 컴포넌트 만들기 전에 `components/`, `app/`, `constants/`에서 비슷한 공용 컴포넌트와 스타일 패턴을 반드시 찾는다.
- 기존 컴포넌트가 거의 맞으면 props/style 주입으로 재사용한다. 단순 스타일 차이만으로 중복 컴포넌트를 만들지 않는다.
- 페이지 전용 반복 UI만 별도 `components/<domain>/...Parts.tsx` 형태로 분리한다.
- 공용 컴포넌트를 바꿀 때는 기본 동작과 기존 화면을 깨지 않도록 optional props 위주로 확장한다.

## Figma Fidelity

- 아이콘/이미지는 항상 Figma를 기준으로 한다. 임의로 비슷한 아이콘을 그리거나 라이브러리 아이콘으로 추측 대체하지 않는다.
- Figma 아이콘을 기존 SVG/Icon 라이브러리로 대체하려면 모양, 의미, 크기, stroke/fill이 충분히 일치해야 한다. 아니면 Figma 에셋 또는 SVG path를 사용한다.
- 카테고리/탭/기능 아이콘처럼 화면 의미를 전달하는 그래픽은 사용자가 직접 넣으라고 넘기지 말고, Figma MCP의 asset/SVG 또는 제공된 SVG에서 추출해 프로젝트 자산으로 렌더링한다.
- 캡처보다 Figma MCP의 design context, screenshot, asset URL을 우선한다.
- 상태바/홈 인디케이터 같은 OS UI는 구현하지 않고 SafeArea/시스템에 맡긴다. 서비스 의미가 있는 그래픽만 Figma 기준으로 구현한다.
- Figma Auto Layout은 `View`, `flexDirection`, `gap`, `alignItems`, `justifyContent`로 변환한다. absolute 좌표 복사는 피한다.
- 색상, 폰트, 간격, radius는 Figma 값을 참고하되 기존 앱 스케일과 모바일 반응형에 맞게 자연스럽게 적용한다.

## Implementation

- API가 아직 없는 요청은 목데이터와 로컬 상태로 플로우만 구성한다.
- 화면 컴포넌트에 비즈니스 로직을 과하게 넣지 않는다.
- props 타입은 `type Props = { ... }` 형태로 명확히 작성한다.
- 스타일은 NativeWind보다 React Native `StyleSheet`를 우선 사용한다.
- 긴 한국어 문구, CTA, 입력 영역이 작은 화면에서 잘리지 않게 한다.

## Flow Check

- 페이지 단위 화면을 만들거나 크게 수정하면 `app/index.tsx` 개발 메뉴에 플로우 확인 버튼을 추가한다.
- `app/test.tsx`는 컴포넌트 단위 샘플일 때만 사용한다.
- 구현 후 가능하면 `pnpm lint`를 실행하고, typecheck 스크립트가 있거나 필요하면 `pnpm exec tsc --noEmit`도 확인한다.

## Response Format

구현 전:
```txt
Figma 분석:
- ...

변경할 파일:
- ...

이유:
- ...

확인 필요:
- ...
```

구현 후:
```txt
변경 요약:
- ...

검증:
- ...

Figma와 다르게 처리한 부분:
- ...

남은 이슈:
- ...
```
