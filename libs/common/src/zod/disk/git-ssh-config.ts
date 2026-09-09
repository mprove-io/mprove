import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type GitSshConfig = {
  keyDir: string;
  publicKey: string;
  privateKeyEncrypted: string;
  passPhrase: string;
};

export let zGitSshConfig = z
  .object({
    keyDir: z.string(),
    publicKey: z.string(),
    privateKeyEncrypted: z.string(),
    passPhrase: z.string()
  })
  .meta({ id: 'GitSshConfig' });

assertTypesEqual<GitSshConfig, z.infer<typeof zGitSshConfig>>({ value: true });
