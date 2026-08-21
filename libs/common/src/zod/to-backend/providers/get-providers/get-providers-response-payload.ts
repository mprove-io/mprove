import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Member } from '#common/zod/backend/member';
import { zMember } from '#common/zod/backend/member';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendGetProvidersResponsePayload = {
  userMember: Member;
  providers: Provider[];
};

export let zToBackendGetProvidersResponsePayload = z
  .object({
    userMember: zMember,
    providers: z.array(zProvider)
  })
  .meta({ id: 'ToBackendGetProvidersResponsePayload' });

assertTypesEqual<
  ToBackendGetProvidersResponsePayload,
  z.infer<typeof zToBackendGetProvidersResponsePayload>
>({ value: true });
