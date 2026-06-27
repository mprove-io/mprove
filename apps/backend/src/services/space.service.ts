import { Injectable } from '@nestjs/common';
import {
  MY_SPACE_ID,
  PERSONAL_SPACE_ID,
  SHARED_SPACE_ID,
  UNCATEGORIZED_SPACE_ID
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
    mySpaceTitle: string;
  }): SpaceNode[] {
    let { spaces, units, member, mySpaceTitle } = item;

    let nodesBySpace = new Map<string, SpaceFolder>();

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

          let space = spaces.find(x => x.space === partSpaceName);

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
          }
        }

        let spaceNode = nodesBySpace.get(spaceName);

        if (isDefined(spaceNode)) {
          let space = spaces.find(x => x.space === spaceName);

          if (isUndefined(space)) {
            return;
          }

          spaceNode.children.push(
            makeSpaceUnitWithSpace({
              unit: unit,
              space: spaceName,
              displaySpace: space.fullTitle
            })
          );
        }

        return;
      }

      let target = makeSpaceUnitTarget({
        space: unit.space,
        author: unit.author,
        accessRoles: unit.accessRoles,
        member: member,
        mySpaceTitle: mySpaceTitle
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

    let myNode = syntheticRootsBySpace.get(MY_SPACE_ID);

    if (isDefined(myNode)) {
      myNode.children = sortSpaceNodes({
        nodes: myNode.children
      });
      nodes.push(myNode);
    }

    nodes.push(...rootFolderNodes);

    let uncategorizedNode = syntheticRootsBySpace.get(UNCATEGORIZED_SPACE_ID);

    if (isDefined(uncategorizedNode)) {
      uncategorizedNode.children = sortSpaceNodes({
        nodes: uncategorizedNode.children
      });
      nodes.push(uncategorizedNode);
    }

    let personalNode = syntheticRootsBySpace.get(PERSONAL_SPACE_ID);

    if (isDefined(personalNode)) {
      personalNode.children = sortSpaceNodes({
        nodes: personalNode.children
      });
      nodes.push(personalNode);
    }

    let sharedNode = syntheticRootsBySpace.get(SHARED_SPACE_ID);

    if (isDefined(sharedNode)) {
      sharedNode.children = sortSpaceNodes({
        nodes: sharedNode.children
      });
      nodes.push(sharedNode);
    }

    return nodes;
  }
}
