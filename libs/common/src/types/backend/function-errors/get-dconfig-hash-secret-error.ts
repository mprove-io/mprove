import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DconfigEntToTabError,
  zDconfigEntToTabError
} from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';

export type GetDconfigHashSecretError = DconfigEntToTabError;

export let zGetDconfigHashSecretError = zDconfigEntToTabError;

assertTypesEqual<
  GetDconfigHashSecretError,
  z.infer<typeof zGetDconfigHashSecretError>
>({ value: true });
