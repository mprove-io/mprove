import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSaveCreateReportError = BackendError;

export let zToBackendSaveCreateReportError = zBackendError;

assertTypesEqual<
  ToBackendSaveCreateReportError,
  z.infer<typeof zToBackendSaveCreateReportError>
>({ value: true });
