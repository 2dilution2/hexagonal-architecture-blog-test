import { prisma } from "../../infra/db/prisma";
import { RefreshRepo } from "../../app/ports/refresh-repo";
import { RefreshToken } from "../../domain/refresh-token";

export class PostgresRefreshRepo implements RefreshRepo {
    async save(userId: string, token: string): Promise<void> {
        await prisma.refreshToken.create({ data: { userId, token } });
    }
    async find(token: string): Promise<RefreshToken | null> {
        return prisma.refreshToken.findUnique({ where: { token } });
    }
    async revoke(token: string): Promise<void> {
        await prisma.refreshToken.delete({ where: { token } });
    }
}