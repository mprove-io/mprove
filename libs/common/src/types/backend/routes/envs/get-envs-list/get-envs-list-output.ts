import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type EnvsItem, zEnvsItem } from '#common/types/backend/envs-item';

export type ToBackendGetEnvsListOutput = {
  envsList: EnvsItem[];
};

export let zToBackendGetEnvsListOutput = z
  .object({
    envsList: z.array(zEnvsItem)
  })
  .meta({ id: 'ToBackendGetEnvsListOutput' });

assertTypesEqual<
  ToBackendGetEnvsListOutput,
  z.infer<typeof zToBackendGetEnvsListOutput>
>({ value: true });
