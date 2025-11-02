import { prisma } from "../../infra/db/prisma";
import { PostRepo } from "../../app/ports/post-repo";
import { Post } from "../../domain/post";

export class PostgresPostRepo implements PostRepo {
    async create(post: Post): Promise<void> {
        await prisma.post.create({ data: post });
    }

    async list(): Promise<Post[]> {
        return prisma.post.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    async listByAuthorId(authorId: string): Promise<Post[]> {
        return prisma.post.findMany({
            where: { authorId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findById(id: string): Promise<Post | null> {
        return prisma.post.findUnique({ where: { id } });
    }

    async update(post: Post): Promise<void> {
        await prisma.post.update({
            where: { id: post.id },
            data: post,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.post.delete({ where: { id } });
    }
}