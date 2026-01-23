import crypto from "crypto";
import { hash } from "bcryptjs";

export const generateAndHashCode = async (): Promise<{
  hashedCode: string;
  expiresAt: Date;
  code: string;
}> => {
  const code = crypto.randomInt(100000, 999999).toString();

  const hashedCode = await hash(code, 10);

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  return { hashedCode, expiresAt, code };
};
