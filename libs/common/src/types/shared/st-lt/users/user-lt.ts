import type { CodexAuth } from '#common/types/backend/parts/codex-auth';
import type { Ui } from '#common/types/backend/parts/ui';

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
