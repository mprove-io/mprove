import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectLt = {
  gitUrl: string;
  defaultBranch: string;
  publicKey: string;
  privateKey: string;
  publicKeyEncrypted: string;
  privateKeyEncrypted: string;
  passPhrase: string;
};

export let zProjectLt = z
  .object({
    gitUrl: z.string(),
    defaultBranch: z.string(),
    publicKey: z.string(),
    privateKey: z.string(),
    publicKeyEncrypted: z.string(),
    privateKeyEncrypted: z.string(),
    passPhrase: z.string()
  })
  .meta({ id: 'ProjectLt' });

assertTypesEqual<ProjectLt, z.infer<typeof zProjectLt>>({ value: true });
