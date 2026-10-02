import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberIsNotEditorOrAdminError = {
  code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN';
};

export let zBackendMemberIsNotEditorOrAdminError = z.object({
  code: z.literal('BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN')
});

assertTypesEqual<
  BackendMemberIsNotEditorOrAdminError,
  z.infer<typeof zBackendMemberIsNotEditorOrAdminError>
>({ value: true });
