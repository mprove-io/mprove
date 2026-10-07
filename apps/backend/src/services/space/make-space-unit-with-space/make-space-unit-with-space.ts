import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

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
