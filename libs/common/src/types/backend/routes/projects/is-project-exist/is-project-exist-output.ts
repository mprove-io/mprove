import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsProjectExistOutput = {
  isExist: boolean;
};

export let zToBackendIsProjectExistOutput = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsProjectExistOutput' });

assertTypesEqual<
  ToBackendIsProjectExistOutput,
  z.infer<typeof zToBackendIsProjectExistOutput>
>({ value: true });
