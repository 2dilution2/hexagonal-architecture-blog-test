import { FastifyRequest, FastifyReply } from "fastify";
import { TokenSigner } from "../../app/ports/token-signer";

export function makeAuthGuard(jwt: TokenSigner) {
  return async function authGuard(req: FastifyRequest, res: FastifyReply) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.code(401).send({
        type: "about:blank",
        title: "Unauthorized",
        detail: "Missing or invalid Authorization header",
      });
    }
    const token = auth.slice("Bearer ".length).trim();
    const payload = jwt.verify<{ sub: string; email?: string }>(token);
    if (!payload) {
      return res.code(401).send({
        type: "about:blank",
        title: "Unauthorized",
        detail: "Invalid or expired token",
      });
    }
    req.user = { sub: payload.sub, email: payload.email };
  };
}
