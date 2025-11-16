import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../auth.service";
import { UserService } from "../user.service";
import { MemoryUserRepo } from "../../../adapters/db/memory-user-repo";
import { MemoryRefreshRepo } from "../../../adapters/db/memory-refresh-repo";
import { BcryptHasher } from "../../../adapters/crypto/bcrypt-hasher";
import { JwtSigner } from "../../../adapters/crypto/jwt-signer";

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let userRepo: MemoryUserRepo;
  let refreshRepo: MemoryRefreshRepo;
  let hasher: BcryptHasher;
  let jwt: JwtSigner;

  beforeEach(() => {
    userRepo = new MemoryUserRepo();
    refreshRepo = new MemoryRefreshRepo();
    hasher = new BcryptHasher();
    jwt = new JwtSigner("test-secret-key");
    userService = new UserService(userRepo, hasher);
    authService = new AuthService(
      userRepo,
      userService,
      hasher,
      jwt,
      refreshRepo
    );
  });

  describe("signUp", () => {
    it("새 사용자를 등록해야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      const result = await authService.signUp(input);

      expect(result.id).toBeDefined();
      const user = await userRepo.findById(result.id);
      expect(user).toBeDefined();
      expect(user?.email).toBe(input.email);
    });

    it("이미 존재하는 이메일로 가입 시 에러를 던져야 함", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await authService.signUp(input);

      await expect(authService.signUp(input)).rejects.toThrow(
        "USER_ALREADY_EXISTS"
      );
    });
  });

  describe("login", () => {
    it("올바른 자격증명으로 로그인 시 토큰을 반환해야 함", async () => {
      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await authService.signUp(signUpInput);

      const loginInput = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await authService.login(loginInput);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("잘못된 이메일로 로그인 시 에러를 던져야 함", async () => {
      const loginInput = {
        email: "wrong@example.com",
        password: "password123",
      };

      await expect(authService.login(loginInput)).rejects.toThrow(
        "INVALID_CREDENTIALS"
      );
    });

    it("잘못된 비밀번호로 로그인 시 에러를 던져야 함", async () => {
      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await authService.signUp(signUpInput);

      const loginInput = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await expect(authService.login(loginInput)).rejects.toThrow(
        "INVALID_CREDENTIALS"
      );
    });

    it("로그인 시 refresh token을 저장해야 함", async () => {
      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      const { id } = await authService.signUp(signUpInput);

      const loginInput = {
        email: "test@example.com",
        password: "password123",
      };

      const { refreshToken } = await authService.login(loginInput);
      const entry = await refreshRepo.find(refreshToken);

      expect(entry).toBeDefined();
      expect(entry?.userId).toBe(id);
    });
  });

  describe("refresh", () => {
    it("유효한 refresh token으로 access token을 갱신해야 함", async () => {
      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await authService.signUp(signUpInput);

      const loginInput = {
        email: "test@example.com",
        password: "password123",
      };

      const { refreshToken } = await authService.login(loginInput);

      const result = await authService.refresh({ refreshToken });

      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).not.toBe(refreshToken);
    });

    it("유효하지 않은 refresh token으로 갱신 시 에러를 던져야 함", async () => {
      const invalidToken = "invalid-token";

      await expect(
        authService.refresh({ refreshToken: invalidToken })
      ).rejects.toThrow("INVALID_REFRESH_TOKEN");
    });

    it("저장되지 않은 refresh token으로 갱신 시 에러를 던져야 함", async () => {
      const signUpInput = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      await authService.signUp(signUpInput);

      // 다른 사용자의 refresh token 생성 (저장되지 않음)
      const fakeToken = jwt.sign({ sub: "fake-user-id" }, 60 * 60 * 24 * 7);

      await expect(
        authService.refresh({ refreshToken: fakeToken })
      ).rejects.toThrow("INVALID_REFRESH_TOKEN");
    });
  });
});

