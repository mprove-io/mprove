import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DconfigEntToTabResultError,
  zDconfigEntToTabResultError
} from '#common/types/backend/function-errors/dconfig-ent-to-tab-result-error';

export type GetDconfigHashSecretResultError = DconfigEntToTabResultError;

export let zGetDconfigHashSecretResultError = zDconfigEntToTabResultError;

assertTypesEqual<
  GetDconfigHashSecretResultError,
  z.infer<typeof zGetDconfigHashSecretResultError>
>({ value: true });
