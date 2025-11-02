import { prisma } from "../../infra/db/prisma";
import { UserRepo } from "../../app/ports/user-repo";
import { User } from "../../domain/user";

export class PostgresUserRepo implements UserRepo {
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async create(user: User): Promise<void> {
        await prisma.user.create({ data: user });
    }
}