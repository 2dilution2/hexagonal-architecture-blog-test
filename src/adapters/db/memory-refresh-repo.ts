import { RefreshRepo } from "../../app/ports/refresh-repo";

export class MemoryRefreshRepo implements RefreshRepo {
    private list: { userId: string, token: string }[] = [];

    async save(userId: string, token: string) {
        this.list.push({ userId, token });
    }

    async find(token: string) {
        return this.list.find(e => e.token === token) ?? null;
    }

    async revoke(token: string) {
        this.list = this.list.filter(e => e.token !== token);
    }
}