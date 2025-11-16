import { PostgresUserRepo } from "../adapters/db/postgres-user-repo";
import { PostgresPostRepo } from "../adapters/db/postgres-post-repo";
import { PostgresRefreshRepo } from "../adapters/db/postgres-refresh-repo";
import { MemoryUserRepo } from "../adapters/db/memory-user-repo";
import { MemoryPostRepo } from "../adapters/db/memory-post-repo";
import { MemoryRefreshRepo } from "../adapters/db/memory-refresh-repo";
import { BcryptHasher } from "../adapters/crypto/bcrypt-hasher";
import { JwtSigner } from "../adapters/crypto/jwt-signer";
import { AuthService } from "../app/services/auth.service";
import { UserService } from "../app/services/user.service";
import { PostService } from "../app/services/post.service";
import { UserRepo } from "../app/ports/user-repo";
import { PostRepo } from "../app/ports/post-repo";
import { RefreshRepo } from "../app/ports/refresh-repo";
import { loadConfig } from "./config";

export function makeContainer() {
  const config = loadConfig();

  // repos (DB 토글: memory | postgres)
  const userRepo: UserRepo =
    config.DB === "memory" ? new MemoryUserRepo() : new PostgresUserRepo();
  const postRepo: PostRepo =
    config.DB === "memory" ? new MemoryPostRepo() : new PostgresPostRepo();
  const refreshRepo: RefreshRepo =
    config.DB === "memory" ? new MemoryRefreshRepo() : new PostgresRefreshRepo();

  // crypto
  const hasher = new BcryptHasher();
  const jwt = new JwtSigner(config.JWT_SECRET);

  // services
  const userService = new UserService(userRepo, hasher);
  const authService = new AuthService(userRepo, userService, hasher, jwt, refreshRepo);
  const postService = new PostService(postRepo);

  return { authService, userService, postService, jwt };
}