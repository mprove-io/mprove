import { Injectable } from '@nestjs/common';
import {
  MY_UNITS_SPACE_ID,
  PERSONAL_UNITS_SPACE_ID,
  SHARED_UNITS_SPACE_ID,
  UNCATEGORIZED_UNITS_SPACE_ID
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { makeSpaceFolder } from '#common/functions/space/make-space-folder';
import { makeSpaceUnitTarget } from '#common/functions/space/make-space-unit-target';
import { makeSpaceUnitWithSpace } from '#common/functions/space/make-space-unit-with-space';
import { makeSyntheticSpaceFolder } from '#common/functions/space/make-synthetic-space-folder';
import { sortSpaceNodes } from '#common/functions/space/sort-space-nodes';
import type { Member } from '#common/zod/backend/member';
import type { SpaceFolder } from '#common/zod/backend/space-folder';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { Space } from '#common/zod/blockml/space';

@Injectable()
export class SpaceService {
  makeSpaceNodes(item: {
    spaces: Space[];
    units: SpaceUnit[];
    member: Member;
  }): SpaceNode[] {
    let { spaces, units, member } = item;

    let spacesByName = new Map(spaces.map(space => [space.space, space]));

    let nodesBySpace = new Map<string, SpaceFolder>();

    let displaySpacesBySpace = new Map<string, string>();

    let rootNodes: SpaceNode[] = [];

    let syntheticRootsBySpace = new Map<string, SpaceFolder>();

    let syntheticChildrenBySpace = new Map<string, SpaceFolder>();

    let sortedUnits = [...units].sort((a, b) => {
      let aTitle = (a.title || a.unitId).toLowerCase();
      let bTitle = (b.title || b.unitId).toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    sortedUnits.forEach(unit => {
      let spaceName = unit.space ?? '';

      if (isDefinedAndNotEmpty(spaceName)) {
        let parts = spaceName.split('.');

        for (let index = 0; index < parts.length; index++) {
          let partSpaceName = parts.slice(0, index + 1).join('.');

          let space = spacesByName.get(partSpaceName);

          let existingNode = nodesBySpace.get(partSpaceName);

          if (isDefined(space) && isUndefined(existingNode)) {
            let spaceNode = makeSpaceFolder({
              space: space,
              title: space.title || parts[index]
            });

            nodesBySpace.set(partSpaceName, spaceNode);

            let parentSpaceName =
              index > 0 ? parts.slice(0, index).join('.') : undefined;

            let parentNode = isDefined(parentSpaceName)
              ? nodesBySpace.get(parentSpaceName)
              : undefined;

            if (isDefined(parentNode)) {
              parentNode.children.push(spaceNode);
            } else {
              rootNodes.push(spaceNode);
            }

            let parentDisplaySpace = isDefined(parentSpaceName)
              ? displaySpacesBySpace.get(parentSpaceName)
              : undefined;

            let displaySpace = isDefinedAndNotEmpty(parentDisplaySpace)
              ? `${parentDisplaySpace} - ${spaceNode.title}`
              : spaceNode.title;

            displaySpacesBySpace.set(partSpaceName, displaySpace);
          }
        }

        let spaceNode = nodesBySpace.get(spaceName);

        if (isDefined(spaceNode)) {
          let displaySpace = displaySpacesBySpace.get(spaceName) ?? '';

          spaceNode.children.push(
            makeSpaceUnitWithSpace({
              unit: unit,
              space: spaceName,
              displaySpace: displaySpace
            })
          );
        }

        return;
      }

      let target = makeSpaceUnitTarget({
        space: unit.space,
        author: unit.author,
        accessRoles: unit.accessRoles,
        member: member
      });

      let rootNode = syntheticRootsBySpace.get(target.rootSpace);

      if (isUndefined(rootNode)) {
        rootNode = makeSyntheticSpaceFolder({
          id: target.rootSpace,
          title: target.rootTitle
        });

        syntheticRootsBySpace.set(target.rootSpace, rootNode);
      }

      let unitWithSpace = makeSpaceUnitWithSpace({
        unit: unit,
        space: target.space,
        displaySpace: target.displaySpace
      });

      if (target.space === target.rootSpace) {
        rootNode.children.push(unitWithSpace);

        return;
      }

      let childNode = syntheticChildrenBySpace.get(target.space);

      if (isUndefined(childNode)) {
        childNode = makeSyntheticSpaceFolder({
          id: target.space,
          title: target.childTitle ?? ''
        });

        syntheticChildrenBySpace.set(target.space, childNode);

        rootNode.children.push(childNode);
      }

      childNode.children.push(unitWithSpace);
    });

    let sortedRootNodes = sortSpaceNodes({ nodes: rootNodes });

    let rootFolderNodes = sortedRootNodes.filter(
      node => node.type === 'spaceFolder'
    );

    let nodes: SpaceNode[] = [];

    let myUnitsNode = syntheticRootsBySpace.get(MY_UNITS_SPACE_ID);

    if (isDefined(myUnitsNode)) {
      myUnitsNode.children = sortSpaceNodes({
        nodes: myUnitsNode.children
      });
      nodes.push(myUnitsNode);
    }

    nodes.push(...rootFolderNodes);

    let uncategorizedUnitsNode = syntheticRootsBySpace.get(
      UNCATEGORIZED_UNITS_SPACE_ID
    );

    if (isDefined(uncategorizedUnitsNode)) {
      uncategorizedUnitsNode.children = sortSpaceNodes({
        nodes: uncategorizedUnitsNode.children
      });
      nodes.push(uncategorizedUnitsNode);
    }

    let personalUnitsNode = syntheticRootsBySpace.get(PERSONAL_UNITS_SPACE_ID);

    if (isDefined(personalUnitsNode)) {
      personalUnitsNode.children = sortSpaceNodes({
        nodes: personalUnitsNode.children
      });
      nodes.push(personalUnitsNode);
    }

    let sharedUnitsNode = syntheticRootsBySpace.get(SHARED_UNITS_SPACE_ID);

    if (isDefined(sharedUnitsNode)) {
      sharedUnitsNode.children = sortSpaceNodes({
        nodes: sharedUnitsNode.children
      });
      nodes.push(sharedUnitsNode);
    }

    return nodes;
  }
}
