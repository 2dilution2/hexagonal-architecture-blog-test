# 📦 템플릿용 TODO

> 목적: 이 리포를 "바로 가져다 쓰는" 보일러플레이트로 다듬는다. 최소 설정으로 동작하고, 어댑터/DB 교체가 쉽도록 구성한다.

---

## 1단계: 기본 동작 (최우선)

템플릿을 복제한 후 바로 실행 가능하도록 하는 필수 작업

- [x] `.env.example` 파일 생성 (DATABASE_URL, JWT_SECRET, PORT)
- [x] `docker-compose.yml`로 로컬 PostgreSQL 제공
  - [x] `npm run db:up` / `npm run db:down` 스크립트
- [x] npm 스크립트 정리: `dev`, `build`, `start`
- [x] README에 "템플릿 사용 가이드" 섹션 추가
  - [x] 복제 → 리네임 → 환경변수 설정 가이드

**완료 기준**: `npm i && npm run dev` 실행 시 서버가 정상 동작 ✅

---

## 2단계: 개발 환경 (우선)

개발자가 편하게 작업할 수 있는 기본 도구 설정

- [x] Prettier/ESLint 기본 설정 파일
- [x] `src/infra/config.ts` 타입세이프 env 로더 (Zod)
- [x] `src/infra/container.ts`에서 DB 토글 (env `DB=memory|postgres`)
- [x] `prisma seed` 스크립트 추가 (샘플 데이터)

**완료 기준**: 환경변수만 설정하면 메모리/PostgreSQL 자동 전환 ✅

---

## 3단계: 테스트 & 품질 (중요)

템플릿의 신뢰성을 위한 테스트 인프라

- [x] Vitest 설정 (`vitest.config.ts`)
- [x] 단위 테스트 예제 2-3개 (Memory\*Repo 사용)
  - [x] `UserService` 테스트 예제
  - [x] `AuthService` 테스트 예제
- [x] 커버리지 스크립트 (`test:cov`)
- [x] GitHub Actions: `ci.yml` (lint, build, test, prisma check)

**완료 기준**: `npm test` 실행 시 테스트 통과 및 CI 자동 실행 ✅

---

## 4단계: 문서화 (중요)

템플릿 사용자가 쉽게 이해하고 커스터마이징할 수 있도록

- [x] "어댑터 교체 가이드" 문서화
  - [x] `MemoryRepo` ↔ `PostgresRepo` 스위칭 방법
  - [x] DI 컨테이너에서 바꾸는 한 줄 코드 예시
  - [x] HTTP, Crypto 어댑터 교체 방법
- [x] README에 아키텍처 설명 보완
  - [x] 어댑터 교체 가이드 섹션 추가
  - [x] 환경변수 설정 가이드 보완

**완료 기준**: 사용자가 어댑터를 쉽게 교체할 수 있음 ✅

---

## 5단계: 선택적 개선 (옵션)

템플릿 품질 향상을 위한 추가 기능

- [x] Dockerfile (멀티스테이지 빌드)
- [x] Git hooks (Husky + lint-staged)
- [x] 에러 응답 표준화 미들웨어
- [x] Pino 로깅 기본 설정
- [x] OpenAPI UI on/off 플래그 (env)
- [x] 이슈/PR 템플릿 (`.github/`)

---

## 최종 완료 기준

- [x] 템플릿 복제 후 `npm i && npm run dev` 바로 동작
- [x] `.env.example`만 채워도 핵심 기능 실행
- [x] `npm test` 성공
- [x] README에 교체 포인트 명시 (DI/DB/HTTP)
- [x] CI 자동 실행 및 통과
