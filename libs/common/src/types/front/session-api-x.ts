import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/parts/session-api';
import type { Extend } from '#common/types/extend';

export type SessionApiX = Extend<
  SessionApi,
  { displayTitle: string; providerLabel: string }
>;

export let zSessionApiX = zSessionApi
  .extend({
    displayTitle: z.string(),
    providerLabel: z.string()
  })
  .meta({ id: 'SessionApiX' });

assertTypesEqual<SessionApiX, z.infer<typeof zSessionApiX>>({ value: true });
