import { MemoryUserRepo } from "../adapters/db/memory-user-repo";
import { BcryptHasher } from "../adapters/crypto/bcrypt-hasher";
import { JwtSigner } from "../adapters/crypto/jwt-signer";
import { MemoryRefreshRepo } from "../adapters/db/memory-refresh-repo";
import { MemoryPostRepo } from "../adapters/db/memory-post-repo";
import { AuthService } from "../app/services/auth.service";
import { UserService } from "../app/services/user.service";
import { PostService } from "../app/services/post.service";

export function makeContainer() {
    // repos
    const userRepo = new MemoryUserRepo();
    const refreshRepo = new MemoryRefreshRepo();
    const postRepo = new MemoryPostRepo();

    // crypto
    const hasher = new BcryptHasher();
    const jwt = new JwtSigner(process.env.JWT_SECRET || "secret");
    
    // auth services
    const userService = new UserService(userRepo, hasher);
    const authService = new AuthService(userRepo, userService, hasher, jwt, refreshRepo);

    // post services
    const postService = new PostService(postRepo);

    return { authService, userService, postService, jwt };
}