import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fileDiffSideValues = ['original', 'modified'] as const;

export type FileDiffSide = (typeof fileDiffSideValues)[number];

export let zFileDiffSide = z.enum(fileDiffSideValues);

assertTypesEqual<FileDiffSide, z.infer<typeof zFileDiffSide>>({
  value: true
});
