import { randomUUID } from "node:crypto";
import { Post } from "../../domain/post";
import { PostRepo } from "../ports/post-repo";
import { CreatePostDto, UpdatePostDto } from "../dto/post.dto";

export class PostService {
  constructor(private postRepo: PostRepo) {}

  async create(input: CreatePostDto): Promise<{ id: string }> {
    const data = CreatePostDto.parse(input);
    const post: Post = {
      id: randomUUID(),
      authorId: data.authorId,
      title: data.title,
      content: data.content,
      published: data.published ?? true,
      createdAt: new Date(),
    };
    await this.postRepo.create(post);
    return { id: post.id };
  }

  async list() {
    return this.postRepo.list();
  }

  async listByAuthor(authorId: string) {
    return this.postRepo.listByAuthorId(authorId);
  }

  async get(id: string) {
    const post = await this.postRepo.findById(id);
    if (!post) throw new Error("POST_NOT_FOUND");
    return post;
  }

  async update(input: UpdatePostDto) {
    const data = UpdatePostDto.parse(input);
    const existing = await this.postRepo.findById(data.id);
    if (!existing) throw new Error("POST_NOT_FOUND");
    if (existing.authorId !== data.actorId) throw new Error("FORBIDDEN");

    const updated: Post = {
      ...existing,
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      published: data.published ?? existing.published,
    };
    await this.postRepo.update(updated);
    return { id: updated.id };
  }

  async delete(id: string, actorId: string) {
    const existing = await this.postRepo.findById(id);
    if (!existing) throw new Error("POST_NOT_FOUND");
    if (existing.authorId !== actorId) throw new Error("FORBIDDEN");
    await this.postRepo.delete(id);
    return { ok: true };
  }
}
