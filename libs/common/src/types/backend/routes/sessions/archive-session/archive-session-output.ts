import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/parts/session-api';

export type ToBackendArchiveSessionOutput = {
  session: SessionApi;
};

export let zToBackendArchiveSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendArchiveSessionOutput' });

assertTypesEqual<
  ToBackendArchiveSessionOutput,
  z.infer<typeof zToBackendArchiveSessionOutput>
>({ value: true });
