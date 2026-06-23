import type { ReportTreeNode } from '#common/zod/backend/report-tree-node';
import type { ReportUnit } from '#common/zod/backend/report-unit';

export function makeReportUnitDisplayAccessRoles(item: {
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

export function makeReportUnitsFromReportNodes(item: {
  reportNodes: ReportTreeNode[];
}): ReportUnit[] {
  let { reportNodes } = item;

  return (reportNodes ?? []).reduce((acc: ReportUnit[], node) => {
    if (node.type === 'reportUnit') {
      acc.push(node);

      return acc;
    }

    acc.push(
      ...makeReportUnitsFromReportNodes({ reportNodes: node.children ?? [] })
    );

    return acc;
  }, []);
}

export function addReportUnitDisplaySpaces(item: {
  reportNodes: ReportTreeNode[];
  pathParts: string[];
}): ReportTreeNode[] {
  let { reportNodes, pathParts } = item;

  return (reportNodes ?? []).map(node => {
    if (node.type === 'reportUnit') {
      return {
        ...node,
        displaySpace: pathParts.join(' - ')
      };
    }

    return {
      ...node,
      children: addReportUnitDisplaySpaces({
        reportNodes: node.children ?? [],
        pathParts: [...pathParts, node.title]
      })
    };
  });
}
