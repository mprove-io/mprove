import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendEditDraftReportError = BackendError;

export let zToBackendEditDraftReportError = zBackendError;

assertTypesEqual<
  ToBackendEditDraftReportError,
  z.infer<typeof zToBackendEditDraftReportError>
>({ value: true });
