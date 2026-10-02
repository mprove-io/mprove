import type { SpaceUnit } from '#common/types/backend/space-unit';

export type SpaceUnitX = SpaceUnit & {
  isMatched?: boolean;
};
