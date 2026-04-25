import { compareSync, hashSync } from 'bcrypt';

export const generateHash = (
  plainText: string,
  saltRounds: number = parseInt(process.env.SALT_ROUNDS || '10', 10),
) => {
  return hashSync(plainText, saltRounds);
};

export const compareHash = (plainText: string, hash: string) => {
  return compareSync(plainText, hash);
};
