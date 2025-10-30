export interface RefreshRepo {
    save(userId: string, token: string): Promise<void>;
    find(token: string): Promise<{userId: string} | null>;
    revoke(token: string): Promise<void>;
}