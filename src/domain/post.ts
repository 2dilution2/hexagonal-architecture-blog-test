export interface Post {
    id: string;
    authorId: string;
    title: string;
    content: string;
    published: boolean;
    createdAt: Date;
}