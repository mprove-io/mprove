import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcSessionEntToTabError,
  zOcSessionEntToTabError
} from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';

export type GetOcSessionBySessionIdError = OcSessionEntToTabError;

export let zGetOcSessionBySessionIdError = zOcSessionEntToTabError;

assertTypesEqual<
  GetOcSessionBySessionIdError,
  z.infer<typeof zGetOcSessionBySessionIdError>
>({ value: true });
