import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

const fileStatusValues = [
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
] as const;

export type FileStatus = (typeof fileStatusValues)[number];

export let zFileStatus = z.enum(fileStatusValues);

assertTypesEqual<FileStatus, z.infer<typeof zFileStatus>>({
  value: true
});
