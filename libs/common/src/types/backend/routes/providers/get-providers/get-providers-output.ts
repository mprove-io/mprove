import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Provider, zProvider } from '#common/types/backend/parts/provider';

export type ToBackendGetProvidersOutput = {
  userMember: Member;
  providers: Provider[];
};

export let zToBackendGetProvidersOutput = z
  .object({
    userMember: zMember,
    providers: z.array(zProvider)
  })
  .meta({ id: 'ToBackendGetProvidersOutput' });

assertTypesEqual<
  ToBackendGetProvidersOutput,
  z.infer<typeof zToBackendGetProvidersOutput>
>({ value: true });
