import { makeContainer } from "./infra/container";
import { buildServer } from "./adapters/http/server";

async function bootstrap() {
    const services = makeContainer();
    const app = buildServer(services);
    const port = Number(process.env.PORT ?? 3000);
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Server is running on port ${port}`);
}

bootstrap().catch(err => {
    console.error(err);
    process.exit(1);
})