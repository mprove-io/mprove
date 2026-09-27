import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditDraftChartError = BackendError;

export let zToBackendEditDraftChartError = zBackendError;

assertTypesEqual<
  ToBackendEditDraftChartError,
  z.infer<typeof zToBackendEditDraftChartError>
>({ value: true });
