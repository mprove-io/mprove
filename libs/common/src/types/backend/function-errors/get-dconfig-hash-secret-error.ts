import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbDconfigsFindFirstError,
  zDbDconfigsFindFirstError
} from '#common/types/backend/function-errors/db/dconfigs/db-dconfigs-find-first-error';

export type GetDconfigHashSecretError = DbDconfigsFindFirstError;

export let zGetDconfigHashSecretError = zDbDconfigsFindFirstError;

assertTypesEqual<
  GetDconfigHashSecretError,
  z.infer<typeof zGetDconfigHashSecretError>
>({ value: true });
