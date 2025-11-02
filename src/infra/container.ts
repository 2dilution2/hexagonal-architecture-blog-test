import { PostgresUserRepo } from "../adapters/db/postgres-user-repo";
import { PostgresPostRepo } from "../adapters/db/postgres-post-repo";
import { PostgresRefreshRepo } from "../adapters/db/postgres-refresh-repo";
import { BcryptHasher } from "../adapters/crypto/bcrypt-hasher";
import { JwtSigner } from "../adapters/crypto/jwt-signer";
import { AuthService } from "../app/services/auth.service";
import { UserService } from "../app/services/user.service";
import { PostService } from "../app/services/post.service";

export function makeContainer() {
  // repos (DB 연결)
  const userRepo = new PostgresUserRepo();
  const refreshRepo = new PostgresRefreshRepo();
  const postRepo = new PostgresPostRepo();

  // crypto
  const hasher = new BcryptHasher();
  const jwt = new JwtSigner(process.env.JWT_SECRET || "secret");

  // services
  const userService = new UserService(userRepo, hasher);
  const authService = new AuthService(userRepo, userService, hasher, jwt, refreshRepo);
  const postService = new PostService(postRepo);

  return { authService, userService, postService, jwt };
}