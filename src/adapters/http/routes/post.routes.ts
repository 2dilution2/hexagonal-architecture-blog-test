import { FastifyInstance, FastifyPluginOptions } from "fastify";


export async function postRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { services: any; authGuard: any }
) {
    const { services, authGuard } = opts;
    const { createPost, listPosts, getPost, updatePost, deletePost } = services;
  
    // Create
    fastify.post("/posts", { preHandler: authGuard }, async (req, res) => {
      try {
        const body = req.body as any;
        const result = await createPost!.execute({
          authorId: req.user!.sub,
          title: body?.title,
          content: body?.content,
          published: body?.published ?? true,
        });
        return res.code(201).send({ postId: result.id });
      } catch (e: any) {
        return res.code(400).send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid input" });
      }
    });
  
    // List (optional authorId filter)
    fastify.get("/posts", async (req, res) => {
      const { authorId } = req.query as any ?? {};
      const list = await listPosts.execute(authorId);
      return res.send({ posts: list });
    });
  
    // Get one
    fastify.get("/posts/:id", async (req, res) => {
      try {
        const { id } = req.params as any;
        const post = await getPost.execute(id);
        return res.send({ post });
      } catch (e: any) {
          if (e?.message === "POST_NOT_FOUND") {
              return res.code(404).send({ type: "about:blank", title: "Not Found", detail: "Post not found" });
          }
          return res.code(400).send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid input" });
      }
    });
  
    // Update (author only)
    fastify.patch("/posts/:id", { preHandler: authGuard }, async (req, res) => {
      try {
        const { id } = req.params as any;
        const body = req.body as any;
        const result = await updatePost.execute({
            id,
            actorId: req.user!.sub,
            title: body?.title,
            content: body?.content,
            published: body?.published,
        });
        return res.send({ post: result.id });
    } catch (e: any) {
        if (e?.message === "POST_NOT_FOUND") {
            return res.code(404).send({ type: "about:blank", title: "Not Found", detail: "Post not found" });
        }
        if (e?.message === "FORBIDDEN") {
            return res.code(403).send({ type: "about:blank", title: "Forbidden", detail: "Not the post author" });
        }
        return res.code(400).send({ type: "about:blank", title: "Bad Request", detail: e?.message ?? "Invalid input" });
    }
    });
  
    // Delete (author only)
    fastify.delete("/posts/:id", { preHandler: authGuard }, async (req, res) => {
      try {
        const { id } = req.params as any;
        const result = await deletePost.execute(id, req.user!.sub);
        return res.send(result);
      } catch (e: any) {
        if (e?.message === "POST_NOT_FOUND") return res.code(404).send({ type:"about:blank", title:"Not Found", detail:"Post not found" });
        if (e?.message === "FORBIDDEN") return res.code(403).send({ type:"about:blank", title:"Forbidden", detail:"Not the author" });
        return res.code(400).send({ type:"about:blank", title:"Bad Request", detail:e?.message ?? "Invalid input" });
      }
    });
  }
  