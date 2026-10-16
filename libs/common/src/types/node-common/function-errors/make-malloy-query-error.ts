import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MalloyToQueryFailedError,
  zMalloyToQueryFailedError
} from '#common/types/backend/errors/malloy-to-query-failed-error';
import type { Extend } from '#common/types/extend';

// Compiler diagnostics are opaque private data, never part of a public response.
export type MakeMalloyQueryError = Extend<
  MalloyToQueryFailedError,
  { customData?: unknown }
>;

export const zMakeMalloyQueryError = zMalloyToQueryFailedError.extend({
  customData: z.unknown().nullish()
});

assertTypesEqual<MakeMalloyQueryError, z.infer<typeof zMakeMalloyQueryError>>({
  value: true
});
