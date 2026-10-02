import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberAlreadyExistsError = {
  code: 'BACKEND_MEMBER_ALREADY_EXISTS';
};

export let zBackendMemberAlreadyExistsError = z.object({
  code: z.literal('BACKEND_MEMBER_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendMemberAlreadyExistsError,
  z.infer<typeof zBackendMemberAlreadyExistsError>
>({ value: true });
