import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type OrgsItem, zOrgsItem } from '#common/zod/backend/orgs-item';

export type ToBackendGetOrgsListOutput = {
  orgsList: OrgsItem[];
};

export let zToBackendGetOrgsListOutput = z
  .object({
    orgsList: z.array(zOrgsItem)
  })
  .meta({ id: 'ToBackendGetOrgsListOutput' });

assertTypesEqual<
  ToBackendGetOrgsListOutput,
  z.infer<typeof zToBackendGetOrgsListOutput>
>({ value: true });
