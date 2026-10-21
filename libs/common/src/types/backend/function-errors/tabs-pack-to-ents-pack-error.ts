import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConvertTabsPackKeyError,
  zConvertTabsPackKeyError
} from '#common/types/backend/function-errors/convert-tabs-pack-key-error';

export type TabsPackToEntsPackError = ConvertTabsPackKeyError;

export let zTabsPackToEntsPackError = zConvertTabsPackKeyError;

assertTypesEqual<
  TabsPackToEntsPackError,
  z.infer<typeof zTabsPackToEntsPackError>
>({
  value: true
});
