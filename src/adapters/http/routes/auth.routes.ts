import { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function authRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { services: any }
) {
  const { services } = opts;
  const { signUp, login, refresh } = services;

  fastify.post("/sign-up", async (req, res) => {
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

  fastify.post("/login", async (req, res) => {
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

  fastify.post("/refresh", async (req, res) => {
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
