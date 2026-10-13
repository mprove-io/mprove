import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type EntsToSessionApisError,
  zEntsToSessionApisError
} from '#common/types/backend/function-errors/ents-to-session-apis-error';

export type GetSessionListError = EntsToSessionApisError;

export let zGetSessionListError = zEntsToSessionApisError;

assertTypesEqual<GetSessionListError, z.infer<typeof zGetSessionListError>>({
  value: true
});
