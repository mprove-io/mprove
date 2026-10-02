import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type NoteLt = {
  publicKey: string;
  privateKey: string;
  publicKeyEncrypted: string;
  privateKeyEncrypted: string;
  passPhrase: string;
};

export let zNoteLt = z
  .object({
    publicKey: z.string(),
    privateKey: z.string(),
    publicKeyEncrypted: z.string(),
    privateKeyEncrypted: z.string(),
    passPhrase: z.string()
  })
  .meta({ id: 'NoteLt' });

assertTypesEqual<NoteLt, z.infer<typeof zNoteLt>>({ value: true });
