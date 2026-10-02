import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type TestConnectionResult = {
  isSuccess: boolean;
  errorMessage: string;
};

export let zTestConnectionResult = z
  .object({
    isSuccess: z.boolean(),
    errorMessage: z.string()
  })
  .meta({ id: 'TestConnectionResult' });

assertTypesEqual<TestConnectionResult, z.infer<typeof zTestConnectionResult>>({
  value: true
});
