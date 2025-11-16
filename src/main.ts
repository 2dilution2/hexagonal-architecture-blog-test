import { makeContainer } from "./infra/container";
import { buildServer } from "./adapters/http/server";
import { loadConfig } from "./infra/config";

async function bootstrap() {
    const config = loadConfig();
    const services = makeContainer();
    const app = buildServer(services);
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    console.log(`🚀 Server is running on port ${config.PORT}`);
    console.log(`📊 Database adapter: ${config.DB}`);
}

bootstrap().catch(err => {
    console.error(err);
    process.exit(1);
})