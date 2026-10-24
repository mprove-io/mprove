import * as bcrypt from 'bcrypt';

export async function createHashUsingSalt(item: {
  salt: string;
  input: string;
}): Promise<string> {
  let { salt, input } = item;

  let hash: string = await bcrypt.hash(input, salt);

  return hash;
}
