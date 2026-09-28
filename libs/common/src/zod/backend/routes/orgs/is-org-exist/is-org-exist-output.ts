import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsOrgExistOutput = {
  isExist: boolean;
};

export let zToBackendIsOrgExistOutput = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsOrgExistOutput' });

assertTypesEqual<
  ToBackendIsOrgExistOutput,
  z.infer<typeof zToBackendIsOrgExistOutput>
>({ value: true });
