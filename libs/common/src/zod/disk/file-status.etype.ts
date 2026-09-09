import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type FileStatusEtype =
  | 'New'
  | 'Deleted'
  | 'Modified'
  | 'Conflicted'
  | 'TypeChange'
  | 'Renamed'
  | 'Ignored'
  | 'Unmodified'
  | 'Copied'
  | 'Untracked'
  | 'Unreadable';

export let zFileStatusEtype = z.enum([
  'New',
  'Deleted',
  'Modified',
  'Conflicted',
  'TypeChange',
  'Renamed',
  'Ignored',
  'Unmodified',
  'Copied',
  'Untracked',
  'Unreadable'
]);

assertTypesEqual<FileStatusEtype, z.infer<typeof zFileStatusEtype>>({
  value: true
});
