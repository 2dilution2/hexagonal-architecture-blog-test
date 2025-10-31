import { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function authRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { services: any }
) {
  const { services } = opts;
  const { signUp, login, refresh } = services;

  fastify.post("/signup", {
    schema: {
      description: "회원가입",
      tags: ["Auth"],
      summary: "새 사용자 회원가입",
      body: {
        type: "object",
        required: ["email", "password", "displayName"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
          displayName: { type: "string", minLength: 1, maxLength: 30, example: "홍길동" },
        },
      },
      response: {
        201: {
          description: "회원가입 성공",
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                displayName: { type: "string" },
              },
            },
          },
        },
        409: {
          description: "이미 존재하는 이메일",
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
        400: {
          description: "잘못된 요청",
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
    },
  }, async (req, res) => {
    try {
        const body = req.body as any;
        const result = await signUp.execute({
            email: body?.email,
            password: body?.password,
            displayName: body?.displayName,
        });
        return res.code(201).send({ user: result });
    } catch (e: any) {
        if (e?.message === "EMAIL_ALREADY_EXISTS") {
            return res
                .code(409)
                .send({ type: "about:blank", title: "Conflict", detail: "Email already exists" });
        }
        return res
            .code(400)
            .send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid request" });
    }
  });

  fastify.post("/login", {
    schema: {
      description: "로그인",
      tags: ["Auth"],
      summary: "사용자 로그인",
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
        },
      },
      response: {
        200: {
          description: "로그인 성공",
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },
        401: {
          description: "인증 실패",
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
        400: {
          description: "잘못된 요청",
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
    },
  }, async (req, res) => {
    try {
        const body = req.body as any;
        const { accessToken, refreshToken } = await login.execute({
        email: body?.email,
        password: body?.password,
        });
        return res.send({ accessToken, refreshToken });
    } catch (e: any) {
        if (e?.message === "INVALID_CREDENTIALS") {
            return res
                .code(401)
                .send({ type: "about:blank", title: "Unauthorized", detail: "Invalid credentials" });
        }
        return res
            .code(400)
            .send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid request" });
    }
  });

  fastify.post("/refresh", {
    schema: {
      description: "액세스 토큰 갱신",
      tags: ["Auth"],
      summary: "리프레시 토큰으로 액세스 토큰 갱신",
      body: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string", minLength: 10, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },
      response: {
        200: {
          description: "토큰 갱신 성공",
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },
        401: {
          description: "유효하지 않은 리프레시 토큰",
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
        400: {
          description: "잘못된 요청",
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
    },
  }, async (req, res) => {
    try {
        const { refreshToken } = req.body as any;
        const { accessToken } = await refresh.execute(refreshToken);
        return res.send({ accessToken });
    } catch (e: any) {
        if (e?.message === "INVALID_REFRESH_TOKEN") {
            return res
                .code(401)
                .send({ type: "about:blank", title: "Unauthorized", detail: "Invalid refresh token" });
        }
        return res
            .code(400)
            .send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid request" });
    }
  });
}
