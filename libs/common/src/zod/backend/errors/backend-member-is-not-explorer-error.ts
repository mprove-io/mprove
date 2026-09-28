import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberIsNotExplorerError = {
  code: 'BACKEND_MEMBER_IS_NOT_EXPLORER';
};

export let zBackendMemberIsNotExplorerError = z.object({
  code: z.literal('BACKEND_MEMBER_IS_NOT_EXPLORER')
});

assertTypesEqual<
  BackendMemberIsNotExplorerError,
  z.infer<typeof zBackendMemberIsNotExplorerError>
>({ value: true });
