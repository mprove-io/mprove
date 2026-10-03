import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileBasic,
  zFileBasic
} from '#common/types/blockml/parts/internal/file-basic';
import {
  type FilePartSpaceFields,
  zFilePartSpaceShape
} from '#common/types/blockml/parts/internal/file-part-space-shape';
import type { Extend } from '#common/types/extend';

export type FilePartSpace = Extend<FileBasic, FilePartSpaceFields>;

export let zFilePartSpace = zFileBasic
  .extend(zFilePartSpaceShape)
  .meta({ id: 'FilePartSpace' });

assertTypesEqual<FilePartSpace, z.infer<typeof zFilePartSpace>>({
  value: true
});
