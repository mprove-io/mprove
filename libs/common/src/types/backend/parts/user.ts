import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Ui, zUi } from '#common/types/backend/parts/ui/ui';

export type User = {
  userId: string;
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  ui: Ui;
  apiKeyPrefix?: string;
  isCodexAuthSet?: boolean;
  codexAuthUpdateTs?: number;
  codexAuthExpiresTs?: number;
  serverTs: number;
};

export let zUser = z
  .object({
    userId: z.string(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isEmailVerified: z.boolean(),
    ui: zUi,
    apiKeyPrefix: z.string().nullish(),
    isCodexAuthSet: z.boolean().nullish(),
    codexAuthUpdateTs: z.number().int().nullish(),
    codexAuthExpiresTs: z.number().int().nullish(),
    serverTs: z.number().int()
  })
  .meta({ id: 'User' });

assertTypesEqual<User, z.infer<typeof zUser>>({ value: true });
