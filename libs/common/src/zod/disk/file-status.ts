import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type FileStatus =
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

export let zFileStatus = z.enum([
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

assertTypesEqual<FileStatus, z.infer<typeof zFileStatus>>({
  value: true
});
