import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConvertTabsPackKeyError,
  zConvertTabsPackKeyError
} from '#common/types/backend/function-errors/convert-tabs-pack-key-error';

export type ConvertWritePackError = ConvertTabsPackKeyError;

export const zConvertWritePackError = zConvertTabsPackKeyError;

assertTypesEqual<ConvertWritePackError, z.infer<typeof zConvertWritePackError>>(
  {
    value: true
  }
);
