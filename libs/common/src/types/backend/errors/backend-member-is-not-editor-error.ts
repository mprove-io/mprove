import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberIsNotEditorError = {
  code: 'BACKEND_MEMBER_IS_NOT_EDITOR';
};

export let zBackendMemberIsNotEditorError = z.object({
  code: z.literal('BACKEND_MEMBER_IS_NOT_EDITOR')
});

assertTypesEqual<
  BackendMemberIsNotEditorError,
  z.infer<typeof zBackendMemberIsNotEditorError>
>({ value: true });
