import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/session-api';

export type ToBackendPauseEditorSessionOutput = {
  session: SessionApi;
};

export let zToBackendPauseEditorSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendPauseEditorSessionOutput' });

assertTypesEqual<
  ToBackendPauseEditorSessionOutput,
  z.infer<typeof zToBackendPauseEditorSessionOutput>
>({ value: true });
