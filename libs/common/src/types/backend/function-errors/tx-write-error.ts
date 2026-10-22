import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DconfigEntToTabError,
  zDconfigEntToTabError
} from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';
import {
  type TabsPackToEntsPackError,
  zTabsPackToEntsPackError
} from '#common/types/backend/function-errors/tabs-pack-to-ents-pack-error';

export type TxWriteError = DconfigEntToTabError | TabsPackToEntsPackError;

export const zTxWriteError = z.union([
  zDconfigEntToTabError,
  zTabsPackToEntsPackError
]);

assertTypesEqual<TxWriteError, z.infer<typeof zTxWriteError>>({
  value: true
});
