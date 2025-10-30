import { UserRepo } from "../ports/user-repo";
import { PasswordHasher } from "../ports/password-hasher";
import { TokenSigner } from "../ports/token-signer";
import { RefreshRepo } from "../ports/refresh-repo";
import { UserService } from "./user.service";
import { SignUpDto, LoginDto, RefreshDto } from "../dto/auth.dto";

export class AuthService {
  constructor(
    private userRepo: UserRepo,
    private userService: UserService,
    private hasher: PasswordHasher,
    private jwt: TokenSigner,
    private refreshRepo: RefreshRepo
  ) {}

  async signUp(input: SignUpDto) {
    const data = SignUpDto.parse(input);
    return this.userService.create(data);
  }

  async login(input: LoginDto) {
    const data = LoginDto.parse(input);
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const valid = await this.hasher.compare(data.password, user.passwordHash);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    const accessToken  = this.jwt.sign({ sub: user.id, email: user.email }, 60 * 15); 
    const refreshToken = this.jwt.sign({ sub: user.id }, 60 * 60 * 24 * 7);
    await this.refreshRepo.save(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(input: RefreshDto) {
    const data = RefreshDto.parse(input);
    const payload = this.jwt.verify(data.refreshToken);
    if (!payload) throw new Error("INVALID_REFRESH_TOKEN");

    const entry = await this.refreshRepo.find(data.refreshToken);
    if (!entry) throw new Error("INVALID_REFRESH_TOKEN");

    const user = await this.userRepo.findById(entry.userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const accessToken = this.jwt.sign({ sub: entry.userId }, 60 * 15);

    return { accessToken };
  }
}
