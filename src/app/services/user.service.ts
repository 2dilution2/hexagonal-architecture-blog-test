import { randomUUID } from "node:crypto";
import { User } from "../../domain/user";
import { UserRepo } from "../ports/user-repo";
import { PasswordHasher } from "../ports/password-hasher";
import { CreateUserDto } from "../dto/user.dto";

export class UserService {
  constructor(private userRepo: UserRepo, private hasher: PasswordHasher) {}

  async create(input: CreateUserDto): Promise<{ id: string }> {
    const data = CreateUserDto.parse(input);
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new Error("USER_ALREADY_EXISTS");

    const passwordHash = await this.hasher.hash(data.password);
    const user: User = {
      id: randomUUID(),
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      createdAt: new Date(),
    };
    await this.userRepo.create(user);
    return { id: user.id };
  }

  async findById(id: string) {
    return this.userRepo.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }
}
