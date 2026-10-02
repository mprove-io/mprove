import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberDoesNotExistError = {
  code: 'BACKEND_MEMBER_DOES_NOT_EXIST';
};

export let zBackendMemberDoesNotExistError = z.object({
  code: z.literal('BACKEND_MEMBER_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendMemberDoesNotExistError,
  z.infer<typeof zBackendMemberDoesNotExistError>
>({ value: true });
