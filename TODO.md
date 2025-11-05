# 📦 템플릿용 TODO (Boilerplate 기준)

> 목적: 이 리포를 “바로 가져다 쓰는” 보일러플레이트로 다듬는다. 최소 설정으로 동작하고, 어댑터/DB 교체가 쉽도록 스캐폴딩·스크립트·문서·CI를 포함한다.

---

## 0) 프로젝트 메타

- [ ] `README`에 “템플릿 사용 가이드” 섹션 추가 (복제→리네임→환경변수)
- [ ] `LICENSE` 검토(ISC 유지 or MIT로 변경)
- [ ] 이슈/PR 템플릿 추가 (`.github/ISSUE_TEMPLATE`, `PULL_REQUEST_TEMPLATE.md`)
- [ ] 기본 라벨 세트 정의 (good first issue 등)

---

## 1) 개발 환경 부트스트랩

- [ ] `.env.example` 제공 (DATABASE_URL, JWT_SECRET, PORT)
- [ ] `pnpm`/`npm` 스크립트 정리: `dev`, `build`, `start`, `lint`, `format`, `test`, `test:watch`
- [ ] Prettier/ESLint 기본 설정 동봉 (템플릿 친화 최소 규칙)
- [ ] Git hooks (Husky + lint-staged) 옵션 제공 – pre-commit: lint & format

---

## 2) 데이터베이스/Prisma

- [ ] `prisma` 스키마 점검(샘플 모델 최소화: User/Post/RefreshToken)
- [ ] `seed` 스크립트 추가 (`npm run seed`) 및 샘플 데이터
- [ ] `docker-compose.yml`로 `postgres:15` 로컬 구동 제공
  - [ ] `npm run db:up` / `npm run db:down` or Makefile

---

## 3) 실행/배포 컨테이너

- [ ] `Dockerfile` (node:20-alpine) 멀티스테이지 빌드
- [ ] `docker-compose.yml` (api + db) 개발용
- [ ] 헬스체크(`/healthz`)와 env 주입 문서화

---

## 4) 테스트 스캐폴딩

- [ ] Vitest 기본 설정(`vitest.config.ts`) + 스크립트 연결
- [ ] `Memory*Repo` 기반 단위 테스트 예제 3개
  - [ ] `UserService` happy/duplicate
  - [ ] `AuthService` login/refresh
  - [ ] `PostService` CRUD/권한
- [ ] HTTP 통합 테스트 예제 (Fastify inject)
- [ ] 커버리지 스크립트 (`test:cov`)

---

## 5) 문서/예제 API

- [ ] OpenAPI UI(/docs) on/off 플래그 (env)
- [ ] “어댑터 교체 가이드” 문서화
  - [ ] `MemoryRepo` ↔ `PostgresRepo` 스위칭 방법
  - [ ] DI 컨테이너에서 바꾸는 한 줄 코드 예시

---

## 6) 보안/운영 기본값

- [ ] 간단 에러 응답 표준화 미들웨어
- [ ] Pino 로깅 + 요청 ID
- [ ] `@fastify/rate-limit` 토글
- [ ] CORS 안전 기본값 (origin env)

---

## 7) CI 템플릿

- [ ] GitHub Actions: `ci.yml`
  - [ ] node setup + install cache
  - [ ] lint / build / test / prisma format/check
  - [ ] (옵션) docker build
- [ ] PR 체크 배지 추가

---

## 8) 코드 구조(템플릿 친화)

- [ ] `src/infra/config.ts` 타입세이프 env 로더(Zod)
- [ ] `src/infra/container.ts`에서 DB 토글(env `DB=memory|postgres`)
- [ ] `src/adapters/http/server.ts` Swagger 등록 토글
- [ ] 폴더-by-feature 안내 주석(README 링크)

---

---

## 9) 선택적 추가(옵션)

- [ ] 예제 UI 클라이언트(`examples/next-app`)에서 /api 연동
- [ ] Makefile 제공 (dev, test, lint, db:up/down)
- [ ] Renovate/Dependabot 설정
- [ ] ADR 템플릿(`docs/adr/0001-use-hexagonal.md`)

---

---

## 완료 기준 (Definition of Done)

- [ ] 템플릿 복제 후 `npm i && npm run dev` 바로 동작
- [ ] `.env.example`만 채워도 핵심 기능(인증/게시글) 실행
- [ ] `npm test` 성공 및 커버리지 리포트 생성
- [ ] README “템플릿 사용 가이드”에 교체 포인트 명시(DI/DB/HTTP)

---

## 🎯 도메인 로직 강화

### 우선순위: 중간
- [ ] **도메인 엔티티 메서드 추가**
  - [ ] `User` 엔티티에 비즈니스 규칙 메서드
  - [ ] `Post` 엔티티에 상태 변경 메서드

- [ ] **Value Objects 패턴**
  - [ ] `Email` Value Object
  - [ ] `Password` Value Object
  - [ ] `UUID` Value Object

- [ ] **도메인 이벤트**
  - [ ] 이벤트 인터페이스 정의
  - [ ] 이벤트 발행 메커니즘
  - [ ] 예: `UserCreatedEvent`, `PostPublishedEvent`

---

## 📖 API 문서 개선

### 우선순위: 낮음
- [ ] **응답 스키마 정의**
  - [ ] 모든 엔드포인트의 응답 DTO 정의
  - [ ] OpenAPI 스키마에 응답 추가

- [ ] **에러 응답 문서화**
  - [ ] 각 엔드포인트별 에러 케이스 문서화
  - [ ] 에러 코드 및 메시지 예시

- [ ] **예제 추가**
  - [ ] 요청/응답 예제 추가
  - [ ] cURL 예제 추가

---

## ⚡ 성능 최적화

### 우선순위: 중간
- [ ] **데이터베이스 쿼리 최적화**
  - [ ] N+1 쿼리 문제 해결
  - [ ] 인덱스 최적화
  - [ ] 쿼리 성능 분석

- [ ] **캐싱 전략**
  - [ ] Redis 도입
  - [ ] 사용자 정보 캐싱
  - [ ] 게시글 목록 캐싱

- [ ] **페이징 구현**
  - [ ] 게시글 목록 페이징
  - [ ] 커서 기반 페이지네이션

---

## 🔒 보안 강화

### 우선순위: 높음
- [ ] **Rate Limiting**
  - [ ] `@fastify/rate-limit` 도입
  - [ ] 로그인 엔드포인트 제한
  - [ ] API 엔드포인트별 제한 설정

- [ ] **CORS 설정**
  - [ ] 환경별 CORS 설정
  - [ ] 허용된 origin 관리

- [ ] **입력 Sanitization**
  - [ ] XSS 방지
  - [ ] SQL Injection 방지 (Prisma 사용으로 이미 대부분 방지됨)

- [ ] **보안 헤더**
  - [ ] Helmet.js 도입
  - [ ] 보안 헤더 설정

---

## 🚀 CI/CD

### 우선순위: 낮음
- [ ] **GitHub Actions 설정**
  - [ ] 테스트 자동 실행
  - [ ] 린트/포맷팅 체크
  - [ ] 빌드 검증

- [ ] **자동 배포**
  - [ ] 스테이징 환경 배포
  - [ ] 프로덕션 환경 배포
  - [ ] 롤백 전략

---

## 📦 기타 개선사항

### 우선순위: 낮음
- [ ] **코드 품질**
  - [ ] ESLint 규칙 강화
  - [ ] Prettier 설정 통일
  - [ ] TypeScript strict 모드 활성화

- [ ] **문서화**
  - [ ] 아키텍처 다이어그램 추가
  - [ ] 코드 주석 보완
  - [ ] 개발 가이드 작성

- [ ] **모니터링**
  - [ ] 헬스체크 엔드포인트 개선
  - [ ] 메트릭 수집 (Prometheus 등)
  - [ ] 알림 설정
