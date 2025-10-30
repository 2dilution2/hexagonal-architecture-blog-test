import Fastify from "fastify";
import { makeAuthGuard } from "./auth-guard";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { postRoutes } from "./routes/post.routes";

export function buildServer(services: any) {
    const app = Fastify({ logger: true });
    const authGuard = makeAuthGuard(services.jwt);

    app.register((instance, _opts, done) => {
        // 라우트 묶음들 등록
        instance.register(authRoutes, { prefix: "/api", services });
        instance.register(userRoutes, { prefix: "/api", services, authGuard });
        instance.register(postRoutes, { prefix: "/api", services, authGuard });
        instance.get("/healthz", async () => ({ ok: true }));
        done();
      });
    app.ready().then(() => {
        app.log.info("\n" + app.printRoutes());
    })

    return app;
}