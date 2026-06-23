import { makeCopy } from '#common/functions/make-copy';
import {
  addReportUnitDisplaySpaces,
  makeReportUnitDisplayAccessRoles
} from '#common/functions/report-tree';
import type { ReportTreeNode } from '#common/zod/backend/report-tree-node';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ReportX } from '#common/zod/backend/report-x';

export function makeReportUnitFromReportX(item: {
  report: ReportX;
  isFavorite?: boolean;
}): ReportUnit {
  let { report, isFavorite } = item;

  return {
    type: 'reportUnit',
    id: report.reportId,
    reportId: report.reportId,
    title: report.title || report.reportId,
    filePath: report.filePath,
    space: report.space,
    accessRoles: report.accessRoles,
    accessRolesCombined: report.accessRolesCombined,
    author: report.author,
    canEditOrDeleteReport: report.canEditOrDeleteReport === true,
    isFavorite: isFavorite === true,
    draft: report.draft,
    displaySpace: report.space ?? '',
    displayAccessRoles: makeReportUnitDisplayAccessRoles({
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined
    })
  };
}

function sortReportNodes(item: { nodes: ReportTreeNode[] }) {
  let { nodes } = item;

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'reportSpace' ? -1 : 1;
    }

    let aTitle = a.title.toLowerCase();
    let bTitle = b.title.toLowerCase();

    return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
  });
}

export function removeReportUnit(item: {
  reportNodes: ReportTreeNode[];
  reportId: string;
}): ReportTreeNode[] {
  let { reportNodes, reportId } = item;

  return makeCopy(reportNodes ?? [])
    .map((node: ReportTreeNode) => {
      if (node.type === 'reportSpace') {
        node.children = removeReportUnit({
          reportNodes: node.children,
          reportId: reportId
        });
      }

      return node;
    })
    .filter((node: ReportTreeNode) =>
      node.type === 'reportUnit' ? node.reportId !== reportId : true
    );
}

function getReportUnitFavorite(item: {
  reportNodes: ReportTreeNode[];
  reportId: string;
}): boolean {
  let { reportNodes, reportId } = item;

  return (reportNodes ?? []).some(node => {
    if (node.type === 'reportUnit') {
      return node.reportId === reportId && node.isFavorite === true;
    }

    return getReportUnitFavorite({
      reportNodes: node.children ?? [],
      reportId: reportId
    });
  });
}

export function updateReportUnitFavorite(item: {
  reportNodes: ReportTreeNode[];
  reportId: string;
  isFavorite: boolean;
}): ReportTreeNode[] {
  let { reportNodes, reportId, isFavorite } = item;

  return makeCopy(reportNodes ?? []).map(node => {
    if (node.type === 'reportUnit') {
      return node.reportId === reportId
        ? {
            ...node,
            isFavorite: isFavorite
          }
        : node;
    }

    return {
      ...node,
      children: updateReportUnitFavorite({
        reportNodes: node.children ?? [],
        reportId: reportId,
        isFavorite: isFavorite
      })
    };
  });
}

export function upsertReportUnit(item: {
  reportNodes: ReportTreeNode[];
  report: ReportX;
}): ReportTreeNode[] {
  let { reportNodes, report } = item;
  let isFavorite = getReportUnitFavorite({
    reportNodes: reportNodes,
    reportId: report.reportId
  });

  let nodes = removeReportUnit({
    reportNodes: reportNodes,
    reportId: report.reportId
  });

  if (report.draft === true) {
    return nodes;
  }

  let reportNode = makeReportUnitFromReportX({
    report: report,
    isFavorite: isFavorite
  });

  if (report.space) {
    let addToSpace = (item: { node: ReportTreeNode }): ReportTreeNode => {
      let { node } = item;

      if (node.type === 'reportSpace') {
        if (node.space === report.space) {
          node.children = sortReportNodes({
            nodes: [...node.children, reportNode]
          });
        } else {
          node.children = node.children.map(child =>
            addToSpace({ node: child })
          );
        }
      }

      return node;
    };

    nodes = nodes.map(node => addToSpace({ node: node }));

    if (hasReportUnit({ nodes: nodes, reportId: report.reportId })) {
      return addReportUnitDisplaySpaces({ reportNodes: nodes, pathParts: [] });
    }
  }

  return addReportUnitDisplaySpaces({
    reportNodes: sortReportNodes({ nodes: [...nodes, reportNode] }),
    pathParts: []
  });
}

function hasReportUnit(item: {
  nodes: ReportTreeNode[];
  reportId: string;
}): boolean {
  let { nodes, reportId } = item;

  return nodes.some(node => {
    if (node.type === 'reportUnit') {
      return node.reportId === reportId;
    }

    return hasReportUnit({ nodes: node.children, reportId: reportId });
  });
}
