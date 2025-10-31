# 🧩 Hexagonal Template (TypeScript + Node.js)

A clean, scalable backend architecture built with **TypeScript**, following the **Hexagonal Architecture (Ports & Adapters)** pattern.  
This template provides a clear separation between domain logic, application services, and external interfaces like HTTP or databases.

---

## 🚀 Features

- ✅ **TypeScript + Zod** for strong typing & validation  
- 🧱 **Hexagonal Architecture (Ports & Adapters)** — clear dependency direction  
- 🧠 **Application-level DTOs** for clean service interfaces  
- 🔐 **Authentication / User / Post** example modules included  
- 🧩 Simple in-memory repositories for testing  
- 💉 Ready for DI container (via `container.ts`)

---

## 📁 Folder Structure

```
src/
├── adapters/          # External world (HTTP, DB, etc.)
│   └── http/
│       └── routes/    # Fastify routes
│
├── app/               # Application layer (use cases)
│   ├── dto/           # Zod DTO schemas for validation
│   └── services/      # Business logic using domain & ports
│
├── domain/            # Core domain models (pure logic)
│   └── post.ts
│
├── infra/             # Infrastructure (DB adapters, etc.)
│
├── container.ts       # Dependency Injection setup
└── server.ts          # Fastify server entry
```

---

## 🧠 Architectural Overview

### Hexagonal (Ports & Adapters)
```
   [Adapters: HTTP, DB, CLI, ...]
              ↑
              |
       (Ports & DTOs)
              ↑
              |
         [Application]
              ↑
              |
          [Domain Core]
```

- **Domain** → contains pure entities (`User`, `Post`, etc.)
- **Application** → contains use cases / business logic (services)
- **Ports** → define what infrastructure must implement (e.g. `UserRepo`)
- **Adapters** → implement those ports for a specific technology (HTTP, DB, etc.)

---

## 📦 Installation

```bash
# Clone the template
git clone https://github.com/your-username/hexagonal-template.git
cd hexagonal-template

# Install dependencies
pnpm install
# or npm install
```

---

## 🧩 Run the Server

```bash
pnpm dev
# or
npm run dev
```

Server will start at [http://localhost:3000](http://localhost:3000)

---

## 🧰 Example Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/signup` | Create a new user |
| `POST` | `/api/login` | Authenticate user |
| `GET` | `/api/me` | Get current user |
| `POST` | `/api/posts` | Create a post |
| `GET` | `/api/posts` | List all posts |
| `GET` | `/api/posts/:id` | Get post detail |
| `GET` | `/api/posts/author/:id` | List posts by author |
| `PATCH` | `/api/posts/:id` | Update post |
| `DELETE` | `/api/posts/:id` | Delete post |

---

## 🧱 Services Overview

### `AuthService`
- Handles signup, login, and token refresh
- Uses `UserService`, `PasswordHasher`, and `TokenSigner`

### `UserService`
- Responsible for user creation and retrieval
- Hashes passwords and checks for duplicates

### `PostService`
- Manages CRUD operations for posts
- Validates ownership before update/delete

---

## 🧾 DTOs Overview

All input data is validated with **Zod** schemas inside `app/dto/`.

Example (`CreatePostDto`):
```ts
export const CreatePostDto = z.object({
  authorId: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  published: z.boolean().optional(),
});
```

Services always call `Dto.parse(input)` for validation.

---

## 💉 Dependency Injection

All services and repositories are registered in `container.ts`:

```ts
import { UserService } from "./app/services/user.service";
import { PostService } from "./app/services/post.service";
import { AuthService } from "./app/services/auth.service";
import { InMemoryUserRepo } from "./infra/repos/in-memory-user-repo";

export const container = {
  userRepo: new InMemoryUserRepo(),
  userService: new UserService(new InMemoryUserRepo(), new BcryptHasher()),
  postService: new PostService(new InMemoryPostRepo()),
  authService: new AuthService(...),
};
```

You can swap `InMemoryRepo` for a real database adapter later without changing any business logic.

---

## 🧩 Philosophy

> **"Business logic should not depend on frameworks."**

- The **domain** and **application** layers are pure TypeScript — framework-agnostic.
- Fastify, Prisma, or any database can be added later as *adapters*.
- This keeps your codebase **modular, testable, and maintainable**.

---

## 🧪 Testing

Each service can be tested in isolation:

```ts
import { PostService } from "../src/app/services/post.service";
import { InMemoryPostRepo } from "../src/infra/repos/in-memory-post-repo";

test("creates a post", async () => {
  const postService = new PostService(new InMemoryPostRepo());
  const result = await postService.create({
    authorId: "123e4567-e89b-12d3-a456-426614174000",
    title: "Hello",
    content: "World",
  });
  expect(result.id).toBeDefined();
});
```

---

## 🧭 Next Steps

- [ ] Add real database adapters (Prisma / PostgreSQL)
- [ ] Add OpenAPI (Swagger) docs via `zod-to-openapi`
- [ ] Add DI framework (e.g. `tsyringe` or `typedi`)
- [ ] Add tests with Vitest / Jest

---

## 🧑‍💻 Author

**Heesuk’s Hexagonal Template**  
Crafted for clarity, modularity, and long-term scalability.
