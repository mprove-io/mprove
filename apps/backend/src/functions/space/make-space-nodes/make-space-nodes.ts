import { makeSpaceFolder } from '#backend/functions/space/make-space-nodes/make-space-folder/make-space-folder';
import {
  makeSpaceUnitTarget,
  type SpaceUnitTarget
} from '#backend/functions/space/make-space-nodes/make-space-unit-target/make-space-unit-target';
import { makeSpaceUnitWithSpace } from '#backend/functions/space/make-space-nodes/make-space-unit-with-space/make-space-unit-with-space';
import { makeSyntheticSpaceFolder } from '#backend/functions/space/make-space-nodes/make-synthetic-space-folder/make-synthetic-space-folder';
import { sortSpaceNodesRecursive as sortSpaceNodes } from '#backend/functions/space/sort-space-nodes-recursive/sort-space-nodes-recursive';
import {
  MY_SPACE_ID,
  PERSONAL_SPACE_ID,
  SHARED_SPACE_ID,
  UNCATEGORIZED_SPACE_ID
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceFolder } from '#common/types/backend/parts/space-folder';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';
import type { Space } from '#common/types/blockml/parts/space';

export function makeSpaceNodes(item: {
  spaces: Space[];
  units: SpaceUnit[];
  member: Member;
  mySpaceTitle: string;
}): SpaceNode[] {
  let { spaces, units, member, mySpaceTitle } = item;

  let nodesBySpace: Map<string, SpaceFolder> = new Map<string, SpaceFolder>();

  let rootNodes: SpaceNode[] = [];

  let syntheticRootsBySpace: Map<string, SpaceFolder> = new Map<
    string,
    SpaceFolder
  >();

  let syntheticChildrenBySpace: Map<string, SpaceFolder> = new Map<
    string,
    SpaceFolder
  >();

  let sortedUnits: SpaceUnit[] = [...units].sort((a, b) => {
    let aTitle: string = (a.title || a.unitId).toLowerCase();

    let bTitle: string = (b.title || b.unitId).toLowerCase();

    return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
  });

  sortedUnits.forEach(unit => {
    let spaceName = unit.space ?? '';

    if (isDefinedAndNotEmpty(spaceName)) {
      let parts: string[] = spaceName.split('.');

      for (let index = 0; index < parts.length; index++) {
        let partSpaceName: string = parts.slice(0, index + 1).join('.');

        let space: Space = spaces.find(x => x.space === partSpaceName);

        let existingNode: SpaceFolder = nodesBySpace.get(partSpaceName);

        if (isDefined(space) && isUndefined(existingNode)) {
          let spaceNode: SpaceFolder = makeSpaceFolder({
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

      let spaceNode: SpaceFolder = nodesBySpace.get(spaceName);

      if (isDefined(spaceNode)) {
        let space: Space = spaces.find(x => x.space === spaceName);

        if (isUndefined(space)) {
          return;
        }

        spaceNode.children.push(
          makeSpaceUnitWithSpace({
            unit: unit,
            space: spaceName,
            spaceFullTitle: space.fullTitle
          })
        );
      }

      return;
    }

    let target: SpaceUnitTarget = makeSpaceUnitTarget({
      space: unit.space,
      author: unit.author,
      accessRoles: unit.accessRoles,
      member: member,
      mySpaceTitle: mySpaceTitle
    });

    let rootNode: SpaceFolder = syntheticRootsBySpace.get(target.rootSpace);

    if (isUndefined(rootNode)) {
      rootNode = makeSyntheticSpaceFolder({
        id: target.rootSpace,
        title: target.rootTitle
      });

      syntheticRootsBySpace.set(target.rootSpace, rootNode);
    }

    let unitWithSpace: SpaceUnit = makeSpaceUnitWithSpace({
      unit: unit,
      space: target.space,
      spaceFullTitle: target.spaceFullTitle
    });

    if (target.space === target.rootSpace) {
      rootNode.children.push(unitWithSpace);

      return;
    }

    let childNode: SpaceFolder = syntheticChildrenBySpace.get(target.space);

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

  let sortedRootNodes: SpaceNode[] = sortSpaceNodes({ nodes: rootNodes });

  let rootFolderNodes: SpaceFolder[] = sortedRootNodes.filter(
    node => node.type === 'spaceFolder'
  );

  let nodes: SpaceNode[] = [];

  let myNode: SpaceFolder = syntheticRootsBySpace.get(MY_SPACE_ID);

  if (isDefined(myNode)) {
    myNode.children = sortSpaceNodes({
      nodes: myNode.children
    });

    nodes.push(myNode);
  }

  nodes.push(...rootFolderNodes);

  let uncategorizedNode: SpaceFolder = syntheticRootsBySpace.get(
    UNCATEGORIZED_SPACE_ID
  );

  if (isDefined(uncategorizedNode)) {
    uncategorizedNode.children = sortSpaceNodes({
      nodes: uncategorizedNode.children
    });

    nodes.push(uncategorizedNode);
  }

  let personalNode: SpaceFolder = syntheticRootsBySpace.get(PERSONAL_SPACE_ID);

  if (isDefined(personalNode)) {
    personalNode.children = sortSpaceNodes({
      nodes: personalNode.children
    });

    nodes.push(personalNode);
  }

  let sharedNode: SpaceFolder = syntheticRootsBySpace.get(SHARED_SPACE_ID);

  if (isDefined(sharedNode)) {
    sharedNode.children = sortSpaceNodes({
      nodes: sharedNode.children
    });

    nodes.push(sharedNode);
  }

  return nodes;
}
