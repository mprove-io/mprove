import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function makeSpaceUnitDisplayAccessRoles(item: {
  accessRoles: string[];
  accessRolesCombined: string[];
}): { role: string; isDirect: boolean }[] {
  let { accessRoles, accessRolesCombined } = item;
  let accessRolesSet = new Set(accessRoles ?? []);

  return (accessRolesCombined ?? []).map(role => ({
    role: role,
    isDirect: accessRolesSet.has(role)
  }));
}

export function makeSpaceUnitsFromSpaceNodes(item: {
  spaceNodes: SpaceNode[];
}): SpaceUnit[] {
  let { spaceNodes } = item;

  return (spaceNodes ?? []).reduce((acc: SpaceUnit[], node) => {
    if (node.type === 'spaceUnit') {
      acc.push(node);

      return acc;
    }

    acc.push(
      ...makeSpaceUnitsFromSpaceNodes({ spaceNodes: node.children ?? [] })
    );

    return acc;
  }, []);
}

export function addSpaceUnitDisplaySpaces(item: {
  spaceNodes: SpaceNode[];
  pathParts: string[];
}): SpaceNode[] {
  let { spaceNodes, pathParts } = item;

  return (spaceNodes ?? []).map(node => {
    if (node.type === 'spaceUnit') {
      return {
        ...node,
        displaySpace: pathParts.join(' - ')
      };
    }

    return {
      ...node,
      children: addSpaceUnitDisplaySpaces({
        spaceNodes: node.children ?? [],
        pathParts: [...pathParts, node.title]
      })
    };
  });
}
