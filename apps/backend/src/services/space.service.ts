import { Injectable } from '@nestjs/common';
import {
  MY_UNITS_SPACE_ID,
  MY_UNITS_TITLE,
  PERSONAL_UNITS_SPACE_ID,
  PERSONAL_UNITS_TITLE,
  SHARED_UNITS_SPACE_ID,
  SHARED_UNITS_TITLE,
  UNCATEGORIZED_UNITS_SPACE_ID,
  UNCATEGORIZED_UNITS_TITLE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
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

    let myUnitsNode: SpaceFolder;

    let rootNodes: SpaceNode[] = [];

    let uncategorizedUnitsNode: SpaceFolder;

    let personalUnitsNode: SpaceFolder;

    let sharedUnitsNode: SpaceFolder;

    let personalNodesByAuthor = new Map<string, SpaceFolder>();

    let sharedNodesByAuthor = new Map<string, SpaceFolder>();

    let isAdminOrEditor = member.isAdmin === true || member.isEditor === true;

    let sortedUnits = [...units].sort((a, b) => {
      let aTitle = (a.title || a.unitId).toLowerCase();
      let bTitle = (b.title || b.unitId).toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    sortedUnits.forEach(unit => {
      let author = unit.author;

      let spaceName = unit.space ?? '';

      if (isDefinedAndNotEmpty(spaceName)) {
        let parts = spaceName.split('.');

        for (let index = 0; index < parts.length; index++) {
          let partSpaceName = parts.slice(0, index + 1).join('.');

          let space = spacesByName.get(partSpaceName);

          let existingNode = nodesBySpace.get(partSpaceName);

          if (isDefined(space) && isUndefined(existingNode)) {
            let spaceNode = this.makeSpaceFolder({
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
            this.makeSpaceUnitWithSpace({
              unit: unit,
              space: spaceName,
              displaySpace: displaySpace
            })
          );
        }

        return;
      }

      if (author === member.alias) {
        if (isUndefined(myUnitsNode)) {
          myUnitsNode = this.makeSyntheticSpaceFolder({
            id: MY_UNITS_SPACE_ID,
            title: MY_UNITS_TITLE
          });
        }

        myUnitsNode.children.push(
          this.makeSpaceUnitWithSpace({
            unit: unit,
            space: MY_UNITS_SPACE_ID,
            displaySpace: MY_UNITS_TITLE
          })
        );

        return;
      }

      if (isUndefined(author)) {
        if (isUndefined(uncategorizedUnitsNode)) {
          uncategorizedUnitsNode = this.makeSyntheticSpaceFolder({
            id: UNCATEGORIZED_UNITS_SPACE_ID,
            title: UNCATEGORIZED_UNITS_TITLE
          });
        }

        uncategorizedUnitsNode.children.push(
          this.makeSpaceUnitWithSpace({
            unit: unit,
            space: UNCATEGORIZED_UNITS_SPACE_ID,
            displaySpace: UNCATEGORIZED_UNITS_TITLE
          })
        );

        return;
      }

      if (
        isAdminOrEditor === true &&
        author !== member.alias &&
        unit.accessRoles.length === 0
      ) {
        if (isUndefined(personalUnitsNode)) {
          personalUnitsNode = this.makeSyntheticSpaceFolder({
            id: PERSONAL_UNITS_SPACE_ID,
            title: PERSONAL_UNITS_TITLE
          });
        }

        let authorTitle = author ?? '';

        let authorSpace = `${PERSONAL_UNITS_SPACE_ID}/${authorTitle}`;

        let authorNode = personalNodesByAuthor.get(authorTitle);

        if (isUndefined(authorNode)) {
          authorNode = this.makeSyntheticSpaceFolder({
            id: authorSpace,
            title: authorTitle
          });

          personalNodesByAuthor.set(authorTitle, authorNode);

          personalUnitsNode.children.push(authorNode);
        }

        authorNode.children.push(
          this.makeSpaceUnitWithSpace({
            unit: unit,
            space: authorSpace,
            displaySpace: `${PERSONAL_UNITS_TITLE} - ${authorTitle}`
          })
        );

        return;
      }

      if (author !== member.alias && unit.accessRoles.length > 0) {
        if (isUndefined(sharedUnitsNode)) {
          sharedUnitsNode = this.makeSyntheticSpaceFolder({
            id: SHARED_UNITS_SPACE_ID,
            title: SHARED_UNITS_TITLE
          });
        }

        let authorTitle = author ?? '';

        let authorSpace = `${SHARED_UNITS_SPACE_ID}/${authorTitle}`;

        let authorNode = sharedNodesByAuthor.get(authorTitle);

        if (isUndefined(authorNode)) {
          authorNode = this.makeSyntheticSpaceFolder({
            id: authorSpace,
            title: authorTitle
          });

          sharedNodesByAuthor.set(authorTitle, authorNode);

          sharedUnitsNode.children.push(authorNode);
        }

        authorNode.children.push(
          this.makeSpaceUnitWithSpace({
            unit: unit,
            space: authorSpace,
            displaySpace: `${SHARED_UNITS_TITLE} - ${authorTitle}`
          })
        );

        return;
      }

      if (isUndefined(uncategorizedUnitsNode)) {
        uncategorizedUnitsNode = this.makeSyntheticSpaceFolder({
          id: UNCATEGORIZED_UNITS_SPACE_ID,
          title: UNCATEGORIZED_UNITS_TITLE
        });
      }

      uncategorizedUnitsNode.children.push(
        this.makeSpaceUnitWithSpace({
          unit: unit,
          space: UNCATEGORIZED_UNITS_SPACE_ID,
          displaySpace: UNCATEGORIZED_UNITS_TITLE
        })
      );
    });

    let sortedRootNodes = this.sortSpaceNodes({ nodes: rootNodes });

    let rootFolderNodes = sortedRootNodes.filter(
      node => node.type === 'spaceFolder'
    );

    let nodes: SpaceNode[] = [];

    if (isDefined(myUnitsNode)) {
      myUnitsNode.children = this.sortSpaceNodes({
        nodes: myUnitsNode.children
      });
      nodes.push(myUnitsNode);
    }

    nodes.push(...rootFolderNodes);

    if (isDefined(uncategorizedUnitsNode)) {
      uncategorizedUnitsNode.children = this.sortSpaceNodes({
        nodes: uncategorizedUnitsNode.children
      });
      nodes.push(uncategorizedUnitsNode);
    }

    if (isDefined(personalUnitsNode)) {
      personalUnitsNode.children = this.sortSpaceNodes({
        nodes: personalUnitsNode.children
      });
      nodes.push(personalUnitsNode);
    }

    if (isDefined(sharedUnitsNode)) {
      sharedUnitsNode.children = this.sortSpaceNodes({
        nodes: sharedUnitsNode.children
      });
      nodes.push(sharedUnitsNode);
    }

    return nodes;
  }

  makeSpaceUnitWithSpace(item: {
    unit: SpaceUnit;
    space: string | undefined;
    displaySpace: string;
  }): SpaceUnit {
    let { unit, space, displaySpace } = item;

    return {
      ...unit,
      space: space,
      displaySpace: displaySpace
    };
  }

  makeSpaceFolder(item: { space: Space; title: string }): SpaceFolder {
    let { space, title } = item;

    return {
      type: 'spaceFolder',
      id: space.space,
      space: space.space,
      filePath: space.filePath,
      title: title,
      accessRoles: space.accessRoles,
      accessRolesCombined: space.accessRolesCombined,
      isSynthetic: false,
      children: []
    };
  }

  makeSyntheticSpaceFolder(item: { id: string; title: string }): SpaceFolder {
    let { id, title } = item;

    return {
      type: 'spaceFolder',
      id: id,
      space: id,
      filePath: '',
      title: title,
      accessRoles: [],
      accessRolesCombined: [],
      isSynthetic: true,
      children: []
    };
  }

  sortSpaceNodes(item: { nodes: SpaceNode[] }): SpaceNode[] {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'spaceFolder') {
          return {
            ...node,
            children: this.sortSpaceNodes({ nodes: node.children ?? [] })
          };
        }

        return node;
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'spaceFolder' ? -1 : 1;
        }

        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      });
  }
}
