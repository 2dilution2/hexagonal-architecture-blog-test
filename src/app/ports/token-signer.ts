export interface TokenSigner {
    sign(payload: object, expiresIn: number): string;
    verify<T>(token: string): T | null;
}