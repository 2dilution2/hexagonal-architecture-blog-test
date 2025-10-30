import { Post } from "../../domain/post";

export interface PostRepo {
    create(post: Post): Promise<void>;
    list(): Promise<Post[]>;
    listByAuthorId(authorId: string): Promise<Post[]>;
    findById(id: string): Promise<Post | null>;
    update(post: Post): Promise<void>;
    delete(id: string): Promise<void>;
}