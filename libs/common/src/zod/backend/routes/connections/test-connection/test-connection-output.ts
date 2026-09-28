import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type TestConnectionResult,
  zTestConnectionResult
} from '#common/zod/backend/connections/test-connection-result';

export type ToBackendTestConnectionOutput = {
  testConnectionResult: TestConnectionResult;
};

export let zToBackendTestConnectionOutput = z
  .object({
    testConnectionResult: zTestConnectionResult
  })
  .meta({ id: 'ToBackendTestConnectionOutput' });

assertTypesEqual<
  ToBackendTestConnectionOutput,
  z.infer<typeof zToBackendTestConnectionOutput>
>({ value: true });
