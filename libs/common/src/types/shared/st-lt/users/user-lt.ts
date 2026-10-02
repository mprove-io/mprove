import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CodexAuth,
  zCodexAuth
} from '#common/types/backend/parts/codex-auth';
import { type Ui, zUi } from '#common/types/backend/parts/ui';

export type UserLt = {
  email: string;
  alias: string;
  passwordHash: string;
  passwordSalt: string;
  firstName: string;
  lastName: string;
  emailVerificationToken: string;
  passwordResetToken: string;
  passwordResetExpiresTs: number;
  ui: Ui;
  apiKeySecretHash?: string;
  apiKeySalt?: string;
  codexAuth?: CodexAuth;
};

export let zUserLt = z
  .object({
    email: z.string(),
    alias: z.string(),
    passwordHash: z.string(),
    passwordSalt: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailVerificationToken: z.string(),
    passwordResetToken: z.string(),
    passwordResetExpiresTs: z.number(),
    ui: zUi,
    apiKeySecretHash: z.string().nullish(),
    apiKeySalt: z.string().nullish(),
    codexAuth: zCodexAuth.nullish()
  })
  .meta({ id: 'UserLt' });

assertTypesEqual<UserLt, z.infer<typeof zUserLt>>({ value: true });
