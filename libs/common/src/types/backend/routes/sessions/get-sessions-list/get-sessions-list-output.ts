import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/parts/session/session-api';

export type ToBackendGetSessionsListOutput = {
  sessions: SessionApi[];
  hasMoreArchived?: boolean;
};

export let zToBackendGetSessionsListOutput = z
  .object({
    sessions: z.array(zSessionApi),
    hasMoreArchived: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendGetSessionsListOutput' });

assertTypesEqual<
  ToBackendGetSessionsListOutput,
  z.infer<typeof zToBackendGetSessionsListOutput>
>({ value: true });
