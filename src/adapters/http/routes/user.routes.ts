import { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function userRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { authGuard: any }
) {
  const { authGuard } = opts;

  fastify.get("/me", { preHandler: authGuard }, async (req) => {
    return { user: { id: req.user!.sub, email: req.user!.email } };
  });
}
