import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetExplorerChartTabError = BackendError;

export let zToBackendGetExplorerChartTabError = zBackendError;

assertTypesEqual<
  ToBackendGetExplorerChartTabError,
  z.infer<typeof zToBackendGetExplorerChartTabError>
>({ value: true });
