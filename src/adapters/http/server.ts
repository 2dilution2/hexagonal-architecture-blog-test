import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { buildOpenApiDoc } from "./openapi";
import { makeAuthGuard } from "./auth-guard";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { postRoutes } from "./routes/post.routes";
import { errorHandler } from "./error-handler";
import { Config } from "../../infra/config";

export function buildServer(services: any, config: Config) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
      transport: isDevelopment
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    },
    ajv: { customOptions: { strict: false } },
  });
  const authGuard = makeAuthGuard(services.jwt);

  // 에러 핸들러 등록
  app.setErrorHandler(errorHandler);

  // Swagger (OpenAPI from Zod)
  app.register(swagger, { openapi: buildOpenApiDoc() as any });

  // Swagger UI는 환경변수로 제어
  if (config.ENABLE_SWAGGER_UI) {
    app.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
    });
  }

  app.register((instance, _opts, done) => {
    // 라우트 묶음들 등록
    instance.register(authRoutes, { prefix: "/api", services });
    instance.register(userRoutes, { prefix: "/api", services, authGuard });
    instance.register(postRoutes, { prefix: "/api", services, authGuard });
    instance.get("/healthz", async () => ({ ok: true }));
    done();
  });
  app.ready().then(() => {
    if (process.platform !== "win32") {
      app.log.info("\n" + app.printRoutes());
    } else {
      const docsInfo = config.ENABLE_SWAGGER_UI
        ? "Routes ready (use /docs for API spec)"
        : "Routes ready (Swagger UI disabled)";
      app.log.info(docsInfo);
    }
  });

  return app;
}
