import { UserRepo } from "../../app/ports/user-repo";
import { User } from "../../domain/user";

export class MemoryUserRepo implements UserRepo {
    private users: User[] = [];

    async findById(id: string): Promise<User | null> {
        return this.users.find(user => user.id === id) ?? null;
    }
    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email === email) ?? null;
    }

    async create(user: User): Promise<void> {
        this.users.push(user);
    }
}