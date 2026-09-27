import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendProduceExplorerChartError = BackendError;

export let zToBackendProduceExplorerChartError = zBackendError;

assertTypesEqual<
  ToBackendProduceExplorerChartError,
  z.infer<typeof zToBackendProduceExplorerChartError>
>({ value: true });
