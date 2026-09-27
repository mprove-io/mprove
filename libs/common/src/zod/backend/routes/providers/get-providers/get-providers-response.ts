import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetProvidersError,
  zToBackendGetProvidersError
} from './get-providers-error';

export type ToBackendGetProvidersOutput = {
  userMember: Member;
  providers: Provider[];
};

export type ToBackendGetProvidersResponse = ToBackendResponse<
  ToBackendGetProvidersOutput,
  ToBackendGetProvidersError
>;

export let zToBackendGetProvidersOutput = z
  .object({
    userMember: zMember,
    providers: z.array(zProvider)
  })
  .meta({ id: 'ToBackendGetProvidersOutput' });

export let zToBackendGetProvidersResponse = makeToBackendResponseSchema({
  success: zToBackendGetProvidersOutput,
  error: zToBackendGetProvidersError
}).meta({ id: 'ToBackendGetProvidersResponse' });

assertTypesEqual<
  ToBackendGetProvidersOutput,
  z.infer<typeof zToBackendGetProvidersOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetProvidersResponse,
  z.infer<typeof zToBackendGetProvidersResponse>
>({ value: true });
