# 🧩 Hexagonal Architecture 블로그 API (TypeScript)

TypeScript와 Node.js로 구현된 **Hexagonal Architecture (포트 & 어댑터 패턴)** 기반의 백엔드 프로젝트입니다.  
비즈니스 로직과 인프라를 명확히 분리하여, 프레임워크에 의존하지 않는 순수한 도메인 로직을 구현합니다.

---

## 🎯 Hexagonal Architecture란?

Hexagonal Architecture는 **포트(Port)와 어댑터(Adapter)** 패턴으로도 불리며, 애플리케이션의 핵심 비즈니스 로직을 외부 세계로부터 격리하는 아키텍처입니다.

### 핵심 원칙

- 외부(Adapters) → Ports → Application → Domain으로만 의존성 이동(단방향)
- Domain/Application은 프레임워크·인프라에 의존하지 않는 순수 TS 코드
- Ports는 “계약(인터페이스)”, Adapters는 “구현(기술)”이므로 쉽게 교체 가능

시각적 개요는 아래 다이어그램을 참고하세요.

### 헥사곤 다이어그램

```mermaid
graph TD
  http[HTTP] --> ports[[Ports]]
  db[DB] --> ports
  crypto[Crypto] --> ports
  ports --> app[Application]
  app --> domain[Domain]
```

---

## 📁 프로젝트 구조

```
src/
├── domain/              # 🎯 도메인 계층 (핵심 비즈니스 엔티티)
│   ├── user.ts          #   - 순수한 데이터 구조
│   ├── post.ts          #   - 비즈니스 규칙만 포함
│   └── refresh-token.ts
│
├── app/                 # 🔧 애플리케이션 계층 (유스케이스)
│   ├── ports/           #   - 포트: 외부 세계와의 계약(인터페이스)
│   │   ├── user-repo.ts
│   │   ├── post-repo.ts
│   │   ├── password-hasher.ts
│   │   └── token-signer.ts
│   │
│   ├── services/        #   - 서비스: 비즈니스 로직 구현
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── post.service.ts
│   │
│   └── dto/             #   - DTO: 입출력 검증 (Zod)
│       ├── auth.dto.ts
│       ├── user.dto.ts
│       └── post.dto.ts
│
├── adapters/            # 🔌 어댑터 계층 (외부 세계와의 통합)
│   ├── http/            #   - HTTP 어댑터 (Fastify)
│   │   ├── routes/      #     * 라우트 핸들러
│   │   ├── server.ts    #     * 서버 설정
│   │   └── openapi.ts   #     * API 문서화
│   │
│   ├── db/              #   - 데이터베이스 어댑터
│   │   ├── postgres-*   #     * PostgreSQL 구현
│   │   └── memory-*      #     * 메모리 구현 (테스트용)
│   │
│   └── crypto/           #   - 암호화 어댑터
│       ├── bcrypt-hasher.ts
│       └── jwt-signer.ts
│
└── infra/               # ⚙️ 인프라 설정
    ├── container.ts     #   - 의존성 주입 컨테이너
    └── db/
        └── prisma.ts    #   - Prisma 클라이언트
```

---

## 🧠 레이어별 상세 설명

### 1. Domain Layer (도메인 계층)

**책임**: 순수한 비즈니스 엔티티 정의

```typescript
// src/domain/user.ts
export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: Date;
}
```

- ✅ 프레임워크나 라이브러리에 **의존하지 않음**
- ✅ 순수 TypeScript 인터페이스/타입
- ✅ 비즈니스 규칙만 포함

### 2. Application Layer (애플리케이션 계층)

#### Ports (포트)

**책임**: 외부 세계와의 계약 정의 (인터페이스)

```typescript
// src/app/ports/user-repo.ts
export interface UserRepo {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(u: User): Promise<void>;
}
```

- ✅ "무엇을" 해야 하는지만 정의 (How는 정의하지 않음)
- ✅ 도메인 모델만 참조
- ✅ 구현은 어댑터에서 담당

#### Services (서비스)

**책임**: 비즈니스 로직 구현

```typescript
// src/app/services/user.service.ts
export class UserService {
  constructor(
    private userRepo: UserRepo,      // 포트에 의존
    private hasher: PasswordHasher   // 포트에 의존
  ) {}

  async create(input: CreateUserDto) {
    // 비즈니스 로직: 중복 체크, 비밀번호 해싱 등
  }
}
```

- ✅ 포트(인터페이스)에만 의존
- ✅ 구체적인 구현체를 직접 참조하지 않음
- ✅ DTO로 입출력 검증

### 3. Adapters Layer (어댑터 계층)

**책임**: 외부 세계와의 실제 통합 구현

#### HTTP Adapter

```typescript
// src/adapters/http/routes/auth.routes.ts
export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/signup', async (req, reply) => {
    // HTTP 요청 → DTO 변환 → Service 호출
    const result = await services.authService.signUp(req.body);
    return reply.code(201).send(result);
  });
}
```

#### Database Adapter

```typescript
// src/adapters/db/postgres-user-repo.ts
export class PostgresUserRepo implements UserRepo {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
  // ... UserRepo 인터페이스 구현
}
```

```typescript
// src/adapters/db/memory-user-repo.ts
export class MemoryUserRepo implements UserRepo {
  private users: User[] = [];
  
  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }
  // ... 테스트용 메모리 구현
}
```

- ✅ 포트를 구현
- ✅ 프레임워크/라이브러리 의존성 허용
- ✅ 같은 포트를 다른 방식으로 구현 가능 (예: Postgres ↔ Memory)

---

## 🔄 의존성 주입 (DI)

`container.ts`에서 모든 의존성을 조립합니다:

```typescript
// src/infra/container.ts
export function makeContainer() {
  // 어댑터 생성
  const userRepo = new PostgresUserRepo();  // 또는 MemoryUserRepo()
  const hasher = new BcryptHasher();
  const jwt = new JwtSigner(process.env.JWT_SECRET || "secret");

  // 서비스 생성 (포트에 의존)
  const userService = new UserService(userRepo, hasher);
  const authService = new AuthService(userRepo, userService, hasher, jwt, refreshRepo);
  const postService = new PostService(postRepo);

  return { authService, userService, postService, jwt };
}
```

**장점**:
- 테스트 시 `MemoryUserRepo`로 쉽게 교체 가능
- 프로덕션에서는 `PostgresUserRepo` 사용
- 비즈니스 로직 코드 변경 없이 인프라 교체 가능

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hexagonal_db"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate
```

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.  
API 문서는 `http://localhost:3000/docs`에서 확인할 수 있습니다.

---

## 📡 API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| `POST` | `/api/signup` | 회원가입 | ❌ |
| `POST` | `/api/login` | 로그인 | ❌ |
| `POST` | `/api/refresh` | 토큰 갱신 | ❌ |

### 사용자 (User)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| `GET` | `/api/me` | 현재 사용자 정보 | ✅ |

### 게시글 (Post)

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| `POST` | `/api/posts` | 게시글 생성 | ✅ |
| `GET` | `/api/posts` | 게시글 목록 | ❌ |
| `GET` | `/api/posts/:id` | 게시글 상세 | ❌ |
| `GET` | `/api/posts/author/:id` | 작성자별 게시글 | ❌ |
| `PATCH` | `/api/posts/:id` | 게시글 수정 | ✅ |
| `DELETE` | `/api/posts/:id` | 게시글 삭제 | ✅ |

---

## 🧪 테스트 예시

Hexagonal Architecture의 장점 중 하나는 **각 레이어를 독립적으로 테스트**할 수 있다는 것입니다:

```typescript
import { UserService } from "../src/app/services/user.service";
import { MemoryUserRepo } from "../src/adapters/db/memory-user-repo";
import { BcryptHasher } from "../src/adapters/crypto/bcrypt-hasher";

test("회원가입 성공", async () => {
  const userRepo = new MemoryUserRepo();  // 메모리 구현
  const hasher = new BcryptHasher();
  const userService = new UserService(userRepo, hasher);

  const result = await userService.create({
    email: "test@example.com",
    password: "password123",
    displayName: "Test User",
  });

  expect(result.id).toBeDefined();
});
```

**비즈니스 로직을 테스트할 때 실제 데이터베이스가 필요 없습니다!**

---

## 🛠️ 기술 스택

- **언어**: TypeScript
- **런타임**: Node.js
- **웹 프레임워크**: Fastify
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **검증**: Zod
- **인증**: JWT (jsonwebtoken)
- **비밀번호 해싱**: bcryptjs
- **API 문서화**: OpenAPI (Swagger) via `@asteasolutions/zod-to-openapi`

---

## 💡 Hexagonal Architecture의 장점

### 1. 테스트 용이성
- 메모리 구현으로 빠른 단위 테스트
- 실제 데이터베이스나 HTTP 서버 없이 비즈니스 로직 테스트 가능

### 2. 유연성
- 데이터베이스 교체 (PostgreSQL → MongoDB) 시 어댑터만 변경
- 웹 프레임워크 교체 (Fastify → Express) 시 HTTP 어댑터만 변경
- 비즈니스 로직은 변경 불필요

### 3. 유지보수성
- 각 레이어의 책임이 명확
- 의존성 방향이 단방향 (외부 → 내부)
- 코드 변경 영향 범위가 제한적

### 4. 프레임워크 독립성
- 도메인과 애플리케이션 계층은 프레임워크에 의존하지 않음
- 나중에 프레임워크를 교체해도 핵심 로직은 그대로 유지

---

## 📝 TODO

프로젝트 개선을 위한 TODO 항목들:

- [ ] **테스트 프레임워크 추가** (Vitest/Jest)
  - 단위 테스트 작성 (Services, Domain)
  - 통합 테스트 작성 (HTTP Adapters)
  - E2E 테스트 작성

- [ ] **에러 핸들링 개선**
  - 커스텀 에러 클래스 정의 (`DomainError`, `ValidationError` 등)
  - 에러 응답 표준화
  - 에러 로깅 전략 수립

- [ ] **환경 변수 관리**
  - `.env.example` 파일 추가
  - 환경별 설정 파일 분리 (dev, prod, test)
  - 환경 변수 검증 (Zod schema)

- [ ] **로깅 전략**
  - 구조화된 로깅 (Pino 등)
  - 로그 레벨 관리
  - 요청/응답 로깅 미들웨어

- [ ] **DI 프레임워크 통합**
  - `tsyringe` 또는 `typedi` 도입
  - 데코레이터 기반 의존성 주입

- [ ] **도메인 로직 강화**
  - 도메인 엔티티에 비즈니스 규칙 메서드 추가
  - Value Objects 패턴 적용
  - 도메인 이벤트 추가

- [ ] **API 문서 개선**
  - 응답 스키마 정의
  - 에러 응답 예시 추가
  - 예제 요청/응답 추가

- [ ] **성능 최적화**
  - 데이터베이스 쿼리 최적화
  - 캐싱 전략 (Redis 등)
  - 페이징 구현

- [ ] **보안 강화**
  - Rate limiting
  - CORS 설정
  - 입력 sanitization

- [ ] **CI/CD 파이프라인**
  - GitHub Actions 설정
  - 자동 테스트 실행
  - 자동 배포

---

## 📚 참고 자료

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Ports and Adapters Pattern](https://www.hexagonalarchitecture.com/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 📄 라이선스

ISC

---

## 👨‍💻 작성자

**Heesuk's Hexagonal Template**  
명확성, 모듈성, 장기 확장성을 위한 설계