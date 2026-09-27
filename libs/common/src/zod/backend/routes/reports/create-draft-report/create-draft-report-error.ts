import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateDraftReportError = BackendError;

export let zToBackendCreateDraftReportError = zBackendError;

assertTypesEqual<
  ToBackendCreateDraftReportError,
  z.infer<typeof zToBackendCreateDraftReportError>
>({ value: true });
