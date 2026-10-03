import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SpaceFolder,
  zSpaceFolder
} from '#common/types/backend/parts/space-folder';
import {
  type SpaceUnit,
  zSpaceUnit
} from '#common/types/backend/parts/space-unit';

export type SpaceNode = SpaceFolder | SpaceUnit;

export let zSpaceNode = z.discriminatedUnion('type', [
  zSpaceFolder,
  zSpaceUnit
]);

assertTypesEqual<SpaceNode, z.infer<typeof zSpaceNode>>({ value: true });
