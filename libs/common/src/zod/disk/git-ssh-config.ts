import { z } from 'zod';

export let zGitSshConfig = z
  .object({
    keyDir: z.string(),
    publicKey: z.string(),
    privateKeyEncrypted: z.string(),
    passPhrase: z.string()
  })
  .meta({ id: 'GitSshConfig' });

export type GitSshConfig = z.infer<typeof zGitSshConfig>;
