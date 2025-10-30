import { PostRepo } from "../../app/ports/post-repo";
import { Post } from "../../domain/post";

export class MemoryPostRepo implements PostRepo {
    private posts: Post[] = [];
    async create(post: Post): Promise<void> {
        this.posts.push(post);
    }
    async list(): Promise<Post[]> {
        return [...this.posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async listByAuthorId(authorId: string): Promise<Post[]> {
        return this.posts.filter(post => post.authorId === authorId);
    }
    async findById(id: string): Promise<Post | null> {
        return this.posts.find(post => post.id === id) ?? null;
    }
    async update(post: Post): Promise<void> {
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
            this.posts[index] = post;
        }
    }
    async delete(id: string): Promise<void> {
        this.posts = this.posts.filter(post => post.id !== id);
    }
}