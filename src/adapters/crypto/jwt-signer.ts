import jwt from "jsonwebtoken";
import { TokenSigner } from "../../app/ports/token-signer";

export class JwtSigner implements TokenSigner {
  constructor(private secret: string) {}
  sign(payload: object, expiresInSec: number): string {
    return jwt.sign(payload, this.secret, { expiresIn: expiresInSec });
  }
  verify<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, this.secret) as T;
    } catch {
      return null;
    }
  }
}
