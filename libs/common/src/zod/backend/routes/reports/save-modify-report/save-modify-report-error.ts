import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSaveModifyReportError = BackendError;

export let zToBackendSaveModifyReportError = zBackendError;

assertTypesEqual<
  ToBackendSaveModifyReportError,
  z.infer<typeof zToBackendSaveModifyReportError>
>({ value: true });
