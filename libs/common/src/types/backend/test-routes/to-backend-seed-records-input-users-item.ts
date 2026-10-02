import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputUsersItem = {
  userId?: string;
  email: string;
  password?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiresTs?: number;
  apiKey?: string;
};

export let zToBackendSeedRecordsInputUsersItem = z
  .object({
    userId: z.string().nullish(),
    email: z.string(),
    password: z.string().nullish(),
    isEmailVerified: z.boolean().nullish(),
    emailVerificationToken: z.string().nullish(),
    passwordResetToken: z.string().nullish(),
    passwordResetExpiresTs: z.number().nullish(),
    apiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputUsersItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputUsersItem,
  z.infer<typeof zToBackendSeedRecordsInputUsersItem>
>({ value: true });
