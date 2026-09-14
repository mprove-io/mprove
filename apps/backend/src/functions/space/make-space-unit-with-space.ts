import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function makeSpaceUnitWithSpace(item: {
  unit: SpaceUnit;
  space: string;
  spaceFullTitle: string;
}): SpaceUnit {
  let { unit, space, spaceFullTitle } = item;

  return {
    ...unit,
    space: space,
    spaceFullTitle: spaceFullTitle
  };
}
