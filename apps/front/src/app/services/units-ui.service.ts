import { Injectable } from '@angular/core';
import { makeCopy } from '#common/functions/make-copy';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { SpaceUnitX } from '#common/zod/backend/space-unit-x';

@Injectable({ providedIn: 'root' })
export class UnitsUiService {
  spaceUnitToSpaceUnitX(item: {
    spaceUnit: SpaceUnit;
    isMatched?: boolean;
  }): SpaceUnitX {
    let { spaceUnit, isMatched } = item;

    return {
      ...spaceUnit,
      isMatched: isMatched
    };
  }

  updateSpaceUnitFavorite(item: {
    spaceNodes: SpaceNode[];
    unitId: string;
    isFavorite: boolean;
  }): SpaceNode[] {
    let { spaceNodes, unitId, isFavorite } = item;

    return makeCopy(spaceNodes ?? []).map(node => {
      if (node.type === 'spaceUnit') {
        return node.unitId === unitId
          ? {
              ...node,
              isFavorite: isFavorite
            }
          : node;
      }

      return {
        ...node,
        children: this.updateSpaceUnitFavorite({
          spaceNodes: node.children ?? [],
          unitId: unitId,
          isFavorite: isFavorite
        })
      };
    });
  }
}
