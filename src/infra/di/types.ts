
import { UserService } from "../../app/services/user.service";
import { AuthService } from "../../app/services/auth.service";
import { PostService } from "../../app/services/post.service";
import { TokenSigner } from "../../app/ports/token-signer";

export interface Services {
  authService: AuthService;
  userService: UserService;
  postService: PostService;
  jwt: TokenSigner;
}
