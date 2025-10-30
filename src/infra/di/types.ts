import { SignUpService } from "../../app/services/sign-up";
import { LoginService } from "../../app/services/login";
import { RefreshService } from "../../app/services/refresh";
import { CreatePostService } from "../../app/services/create-post";
import { ListPostsService } from "../../app/services/list-posts";
import { GetPostService } from "../../app/services/get-post";
import { UpdatePostService } from "../../app/services/update-post";
import { DeletePostService } from "../../app/services/delete-post";
import { TokenSigner } from "../../app/ports/token-signer";

export interface Services {
  jwt: TokenSigner;
  signUp: SignUpService;
  login: LoginService;
  refresh: RefreshService;
  createPost: CreatePostService;
  listPosts: ListPostsService;
  getPost: GetPostService;
  updatePost: UpdatePostService;
  deletePost: DeletePostService;
}
