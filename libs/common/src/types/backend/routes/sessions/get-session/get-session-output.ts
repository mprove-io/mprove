import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcSessionApi,
  zOcSessionApi
} from '#common/types/backend/parts/oc-session-api';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/parts/session-api';
import {
  type SessionEventApi,
  zSessionEventApi
} from '#common/types/backend/parts/session-event-api';
import {
  type SessionMessageApi,
  zSessionMessageApi
} from '#common/types/backend/parts/session-message-api';
import {
  type SessionPartApi,
  zSessionPartApi
} from '#common/types/backend/parts/session-part-api';

export type ToBackendGetSessionOutput = {
  session: SessionApi;
  ocSession: OcSessionApi;
  lastEventIndex: number;
  messages: SessionMessageApi[];
  parts: SessionPartApi[];
  events: SessionEventApi[];
  sessions: SessionApi[];
  hasMoreArchived: boolean;
};

export let zToBackendGetSessionOutput = z
  .object({
    session: zSessionApi,
    ocSession: zOcSessionApi,
    lastEventIndex: z.number(),
    messages: z.array(zSessionMessageApi),
    parts: z.array(zSessionPartApi),
    events: z.array(zSessionEventApi),
    sessions: z.array(zSessionApi),
    hasMoreArchived: z.boolean()
  })
  .meta({ id: 'ToBackendGetSessionOutput' });

assertTypesEqual<
  ToBackendGetSessionOutput,
  z.infer<typeof zToBackendGetSessionOutput>
>({ value: true });
