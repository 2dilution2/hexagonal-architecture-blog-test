import { describe, it, expect, beforeEach } from "vitest";
import { UserService } from "../user.service";
import { MemoryUserRepo } from "../../../adapters/db/memory-user-repo";
import { BcryptHasher } from "../../../adapters/crypto/bcrypt-hasher";

describe("UserService", () => {
  let userService: UserService;
  let userRepo: MemoryUserRepo;
  let hasher: BcryptHasher;

  beforeEach(() => {
    userRepo = new MemoryUserRepo();
    hasher = new BcryptHasher();
    userService = new UserService(userRepo, hasher);
  });

  describe("create", () => {
    it("새 사용자를 생성해야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      const result = await userService.create(input);

      expect(result.id).toBeDefined();
      const user = await userRepo.findById(result.id);
      expect(user).toBeDefined();
      expect(user?.email).toBe(input.email);
      expect(user?.displayName).toBe(input.displayName);
      expect(user?.passwordHash).not.toBe(input.password);
    });

    it("이미 존재하는 이메일로 생성 시 에러를 던져야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await userService.create(input);

      await expect(userService.create(input)).rejects.toThrow(
        "USER_ALREADY_EXISTS"
      );
    });

    it("비밀번호를 해시화해야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      const result = await userService.create(input);
      const user = await userRepo.findById(result.id);

      expect(user?.passwordHash).not.toBe(input.password);
      const isValid = await hasher.compare(input.password, user!.passwordHash);
      expect(isValid).toBe(true);
    });
  });

  describe("findById", () => {
    it("ID로 사용자를 찾아야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      const { id } = await userService.create(input);
      const user = await userService.findById(id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(id);
      expect(user?.email).toBe(input.email);
    });

    it("존재하지 않는 ID는 null을 반환해야 함", async () => {
      const user = await userService.findById("non-existent-id");
      expect(user).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("이메일로 사용자를 찾아야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await userService.create(input);
      const user = await userService.findByEmail(input.email);

      expect(user).toBeDefined();
      expect(user?.email).toBe(input.email);
    });

    it("존재하지 않는 이메일은 null을 반환해야 함", async () => {
      const user = await userService.findByEmail("notfound@example.com");
      expect(user).toBeNull();
    });
  });
});

