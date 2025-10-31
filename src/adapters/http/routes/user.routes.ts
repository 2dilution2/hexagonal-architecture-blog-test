import { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function userRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { authGuard: any }
) {
  const { authGuard } = opts;

  fastify.get("/me", {
    preHandler: authGuard,
    schema: {
      description: "현재 사용자 정보 조회",
      tags: ["User"],
      summary: "인증된 사용자 정보 가져오기",
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: "사용자 정보",
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
                email: { type: "string", format: "email", example: "user@example.com" },
              },
            },
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
      },
    },
  }, async (req) => {
    return { user: { id: req.user!.sub, email: req.user!.email } };
  });
}
