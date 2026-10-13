import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcSessionEntToTabError,
  zOcSessionEntToTabError
} from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import {
  type SessionEntToTabError,
  zSessionEntToTabError
} from '#common/types/backend/function-errors/session-ent-to-tab-error';

export type EntsToSessionApisError =
  | OcSessionEntToTabError
  | SessionEntToTabError;

export let zEntsToSessionApisError = z.union([
  zOcSessionEntToTabError,
  zSessionEntToTabError
]);

assertTypesEqual<
  EntsToSessionApisError,
  z.infer<typeof zEntsToSessionApisError>
>({ value: true });
