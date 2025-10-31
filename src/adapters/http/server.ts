import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { makeAuthGuard } from "./auth-guard";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { postRoutes } from "./routes/post.routes";

export function buildServer(services: any) {
    const app = Fastify({ logger: true, ajv: { customOptions: { strict: false } } });
    const authGuard = makeAuthGuard(services.jwt);

    // Swagger 설정
    app.register(swagger, {
        openapi: {
            openapi: "3.0.0",
            info: {
                title: "Hexagonal Template API",
                description: "API documentation for Hexagonal Template",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3000",
                    description: "Local development server",
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
        },
    });

    app.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
    });

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
            app.log.info("Routes ready (use /docs for API spec)");
        }
    })

    return app;
}