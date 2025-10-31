import { z } from "zod";
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { SignUpDto, LoginDto, RefreshDto } from "../../app/dto/auth.dto";
import { CreatePostDto, UpdatePostDto } from "../../app/dto/post.dto";

extendZodWithOpenApi(z);

export function buildOpenApiDoc() {
    const registry = new OpenAPIRegistry();

    // Components: Schemas
    registry.register("SignUpDto", SignUpDto);
    registry.register("LoginDto", LoginDto);
    registry.register("RefreshDto", RefreshDto);
    registry.register("CreatePostDto", CreatePostDto.omit({ authorId: true }));
    registry.register("UpdatePostDto", UpdatePostDto.omit({ actorId: true }));

    // Security Scheme
    registry.registerComponent("securitySchemes", "bearerAuth", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
    });

    // Auth routes
    registry.registerPath({
        method: "post",
        path: "/api/sign-up",
        tags: ["Auth"],
        request: {
            body: {
                content: {
                    "application/json": { schema: SignUpDto }
                }
            }
        },
        responses: {
            201: {
                description: "회원가입 성공",
            },
            409: { description: "이미 존재하는 이메일" },
            400: { description: "잘못된 요청" },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/api/login",
        tags: ["Auth"],
        request: {
            body: { content: { "application/json": { schema: LoginDto } } }
        },
        responses: {
            200: {
                description: "로그인 성공",
                content: {
                    "application/json": {
                        schema: z.object({
                            accessToken: z.string(),
                            refreshToken: z.string(),
                        })
                    }
                }
            },
            401: { description: "인증 실패" },
            400: { description: "잘못된 요청" },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/api/refresh",
        tags: ["Auth"],
        request: {
            body: { content: { "application/json": { schema: RefreshDto } } }
        },
        responses: {
            200: {
                description: "토큰 갱신 성공",
                content: {
                    "application/json": {
                        schema: z.object({ accessToken: z.string() })
                    }
                }
            },
            401: { description: "유효하지 않은 리프레시 토큰" },
            400: { description: "잘못된 요청" },
        },
    });

    // User routes
    registry.registerPath({
        method: "get",
        path: "/api/me",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "사용자 정보",
                content: {
                    "application/json": {
                        schema: z.object({
                            user: z.object({ id: z.string().uuid(), email: z.string().email() })
                        })
                    }
                }
            },
            401: { description: "인증 실패" },
        },
    });

    // Post routes
    registry.registerPath({
        method: "post",
        path: "/api/posts",
        tags: ["Post"],
        security: [{ bearerAuth: [] }],
        request: {
            body: { content: { "application/json": { schema: CreatePostDto.omit({ authorId: true }) } } }
        },
        responses: {
            201: { description: "게시글 생성 성공" },
            400: { description: "잘못된 요청" },
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/posts",
        tags: ["Post"],
        request: {
            query: z.object({ authorId: z.string().uuid().optional() }).partial()
        },
        responses: {
            200: {
                description: "게시글 목록",
                content: {
                    "application/json": {
                        schema: z.object({ posts: z.array(z.any()) })
                    }
                }
            }
        },
    });

    registry.registerPath({
        method: "get",
        path: "/api/posts/{id}",
        tags: ["Post"],
        request: { params: z.object({ id: z.string().uuid() }) },
        responses: {
            200: { description: "게시글 정보" },
            404: { description: "게시글을 찾을 수 없음" },
            400: { description: "잘못된 요청" },
        },
    });

    registry.registerPath({
        method: "patch",
        path: "/api/posts/{id}",
        tags: ["Post"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string().uuid() }),
            body: { content: { "application/json": { schema: UpdatePostDto.omit({ actorId: true }) } } },
        },
        responses: {
            200: { description: "게시글 수정 성공" },
            404: { description: "게시글을 찾을 수 없음" },
            403: { description: "권한 없음" },
            400: { description: "잘못된 요청" },
        },
    });

    registry.registerPath({
        method: "delete",
        path: "/api/posts/{id}",
        tags: ["Post"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string().uuid() }) },
        responses: {
            200: { description: "게시글 삭제 성공" },
            404: { description: "게시글을 찾을 수 없음" },
            403: { description: "권한 없음" },
            400: { description: "잘못된 요청" },
        },
    });

    const generator = new OpenApiGeneratorV3(registry.definitions);
    const doc = generator.generateDocument({
        openapi: "3.0.0",
        info: {
            title: "Hexagonal Template API",
            version: "1.0.0",
            description: "API documentation generated from Zod schemas",
        },
        servers: [
            { url: "http://localhost:3000", description: "Local development server" }
        ]
    });

    return doc;
}


