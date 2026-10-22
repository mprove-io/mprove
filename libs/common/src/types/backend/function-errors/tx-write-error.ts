import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConvertWritePackError,
  zConvertWritePackError
} from '#common/types/backend/function-errors/convert-write-pack-error';
import {
  type DconfigEntToTabError,
  zDconfigEntToTabError
} from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';

export type TxWriteError = DconfigEntToTabError | ConvertWritePackError;

export const zTxWriteError = z.union([
  zDconfigEntToTabError,
  zConvertWritePackError
]);

assertTypesEqual<TxWriteError, z.infer<typeof zTxWriteError>>({
  value: true
});
