import * as bcrypt from 'bcrypt';

export type CreateSaltAndHashOutput = {
  salt: string;
  hash: string;
};

export async function createSaltAndHash(item: {
  input: string;
}): Promise<CreateSaltAndHashOutput> {
  let { input } = item;

  let salt: string = await bcrypt.genSalt();

  let hash: string = await bcrypt.hash(input, salt);

  let output: CreateSaltAndHashOutput = { salt: salt, hash: hash };

  return output;
}
