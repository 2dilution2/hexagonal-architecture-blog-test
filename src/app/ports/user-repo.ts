import { User } from "../../domain/user";

export interface UserRepo {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(u: User): Promise<void>;
}