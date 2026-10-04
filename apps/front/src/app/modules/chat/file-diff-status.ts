import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fileDiffStatusValues = ['added', 'deleted', 'modified'] as const;

export type FileDiffStatus = (typeof fileDiffStatusValues)[number];

export let zFileDiffStatus = z.enum(fileDiffStatusValues);

assertTypesEqual<FileDiffStatus, z.infer<typeof zFileDiffStatus>>({
  value: true
});
