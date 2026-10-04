import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const editorPermissionReplyValues = ['always', 'once', 'reject'] as const;

export type EditorPermissionReply =
  (typeof editorPermissionReplyValues)[number];

export let zEditorPermissionReply = z.enum(editorPermissionReplyValues);

assertTypesEqual<EditorPermissionReply, z.infer<typeof zEditorPermissionReply>>(
  {
    value: true
  }
);
