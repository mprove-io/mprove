import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateDraftChartError = BackendError;

export let zToBackendCreateDraftChartError = zBackendError;

assertTypesEqual<
  ToBackendCreateDraftChartError,
  z.infer<typeof zToBackendCreateDraftChartError>
>({ value: true });
