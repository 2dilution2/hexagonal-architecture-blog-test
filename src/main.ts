import { makeContainer } from "./infra/container";
import { buildServer } from "./adapters/http/server";
import { loadConfig } from "./infra/config";

async function bootstrap() {
  const config = loadConfig();
  const services = makeContainer();
  const app = buildServer(services, config);
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  console.log(`🚀 Server is running on port ${config.PORT}`);
  console.log(`📊 Database adapter: ${config.DB}`);
  if (config.ENABLE_SWAGGER_UI) {
    console.log(`📖 Swagger UI: http://localhost:${config.PORT}/docs`);
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
