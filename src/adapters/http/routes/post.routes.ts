import { FastifyInstance, FastifyPluginOptions } from "fastify";


export async function postRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { services: any; authGuard: any }
) {
    const { services, authGuard } = opts;
    const { createPost, listPosts, getPost, updatePost, deletePost } = services;
  
    // Create
    fastify.post("/posts", {
      preHandler: authGuard,
      schema: {
        description: "게시글 생성",
        tags: ["Post"],
        summary: "새 게시글 작성",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: { type: "string", minLength: 1, maxLength: 100, example: "게시글 제목" },
            content: { type: "string", minLength: 1, example: "게시글 내용" },
            published: { type: "boolean", default: true, example: true },
          },
        },
        response: {
          201: {
            description: "게시글 생성 성공",
            type: "object",
            properties: {
              postId: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
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
        const result = await createPost!.execute({
          authorId: req.user!.sub,
          title: body?.title,
          content: body?.content,
          published: body?.published ?? true,
        });
        return res.code(201).send({ postId: result.id });
      } catch (e: any) {
        return res.code(400).send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid input" });
      }
    });
  
    // List (optional authorId filter)
    fastify.get("/posts", {
      schema: {
        description: "게시글 목록 조회",
        tags: ["Post"],
        summary: "게시글 목록 가져오기 (작성자 필터 옵션)",
        querystring: {
          type: "object",
          properties: {
            authorId: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
          },
        },
        response: {
          200: {
            description: "게시글 목록",
            type: "object",
            properties: {
              posts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    content: { type: "string" },
                    published: { type: "boolean" },
                    authorId: { type: "string", format: "uuid" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    }, async (req, res) => {
      const { authorId } = req.query as any ?? {};
      const list = await listPosts.execute(authorId);
      return res.send({ posts: list });
    });
  
    // Get one
    fastify.get("/posts/:id", {
      schema: {
        description: "게시글 조회",
        tags: ["Post"],
        summary: "특정 게시글 가져오기",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
          },
        },
        response: {
          200: {
            description: "게시글 정보",
            type: "object",
            properties: {
              post: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  content: { type: "string" },
                  published: { type: "boolean" },
                  authorId: { type: "string", format: "uuid" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "게시글을 찾을 수 없음",
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
        const { id } = req.params as any;
        const post = await getPost.execute(id);
        return res.send({ post });
      } catch (e: any) {
          if (e?.message === "POST_NOT_FOUND") {
              return res.code(404).send({ type: "about:blank", title: "Not Found", detail: "Post not found" });
          }
          return res.code(400).send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid input" });
      }
    });
  
    // Update (author only)
    fastify.patch("/posts/:id", {
      preHandler: authGuard,
      schema: {
        description: "게시글 수정",
        tags: ["Post"],
        summary: "게시글 수정 (작성자만 가능)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
          },
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1, maxLength: 100, example: "수정된 제목" },
            content: { type: "string", minLength: 1, example: "수정된 내용" },
            published: { type: "boolean", example: false },
          },
        },
        response: {
          200: {
            description: "게시글 수정 성공",
            type: "object",
            properties: {
              post: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
            },
          },
          404: {
            description: "게시글을 찾을 수 없음",
            type: "object",
            properties: {
              type: { type: "string" },
              title: { type: "string" },
              detail: { type: "string" },
            },
          },
          403: {
            description: "권한 없음",
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
        const { id } = req.params as any;
        const body = req.body as any;
        const result = await updatePost.execute({
            id,
            actorId: req.user!.sub,
            title: body?.title,
            content: body?.content,
            published: body?.published,
        });
        return res.send({ post: result.id });
    } catch (e: any) {
        if (e?.message === "POST_NOT_FOUND") {
            return res.code(404).send({ type: "about:blank", title: "Not Found", detail: "Post not found" });
        }
        if (e?.message === "FORBIDDEN") {
            return res.code(403).send({ type: "about:blank", title: "Forbidden", detail: "Not the post author" });
        }
        return res.code(400).send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid input" });
    }
    });
  
    // Delete (author only)
    fastify.delete("/posts/:id", {
      preHandler: authGuard,
      schema: {
        description: "게시글 삭제",
        tags: ["Post"],
        summary: "게시글 삭제 (작성자만 가능)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
          },
        },
        response: {
          200: {
            description: "게시글 삭제 성공",
            type: "object",
            properties: {
              deleted: { type: "boolean", example: true },
            },
          },
          404: {
            description: "게시글을 찾을 수 없음",
            type: "object",
            properties: {
              type: { type: "string" },
              title: { type: "string" },
              detail: { type: "string" },
            },
          },
          403: {
            description: "권한 없음",
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
        const { id } = req.params as any;
        const result = await deletePost.execute(id, req.user!.sub);
        return res.send(result);
      } catch (e: any) {
        if (e?.message === "POST_NOT_FOUND") return res.code(404).send({ type:"about:blank", title:"Not Found", detail:"Post not found" });
        if (e?.message === "FORBIDDEN") return res.code(403).send({ type:"about:blank", title:"Forbidden", detail:"Not the author" });
        return res.code(400).send({ type:"about:blank", title:"Bad Request", detail:e?.message ?? "Invalid input" });
      }
    });
  }
  