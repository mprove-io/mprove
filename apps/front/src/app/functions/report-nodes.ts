import { makeCopy } from '#common/functions/make-copy';
import type { ReportNode } from '#common/zod/backend/report-node';
import type { ReportX } from '#common/zod/backend/report-x';

function makeReportNode(item: { report: ReportX }): ReportNode {
  let { report } = item;

  return {
    type: 'report',
    id: report.reportId,
    reportId: report.reportId,
    title: report.title || report.reportId,
    space: report.space,
    accessRoles: report.accessRoles,
    accessRolesCombined: report.accessRolesCombined
  };
}

function sortReportNodes(item: { nodes: ReportNode[] }) {
  let { nodes } = item;

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'space' ? -1 : 1;
    }

    let aTitle = a.title.toLowerCase();
    let bTitle = b.title.toLowerCase();

    return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
  });
}

function hasReportNode(item: {
  nodes: ReportNode[];
  reportId: string;
}): boolean {
  let { nodes, reportId } = item;

  return nodes.some(node => {
    if (node.type === 'report') {
      return node.reportId === reportId;
    }

    return hasReportNode({ nodes: node.children, reportId: reportId });
  });
}

export function removeReportNode(item: {
  reportNodes: ReportNode[];
  reportId: string;
}): ReportNode[] {
  let { reportNodes, reportId } = item;

  return makeCopy(reportNodes ?? [])
    .map((node: ReportNode) => {
      if (node.type === 'space') {
        node.children = removeReportNode({
          reportNodes: node.children,
          reportId: reportId
        });
      }

      return node;
    })
    .filter((node: ReportNode) =>
      node.type === 'report' ? node.reportId !== reportId : true
    );
}

export function upsertReportNode(item: {
  reportNodes: ReportNode[];
  report: ReportX;
}): ReportNode[] {
  let { reportNodes, report } = item;

  let nodes = removeReportNode({
    reportNodes: reportNodes,
    reportId: report.reportId
  });

  if (report.draft === true) {
    return nodes;
  }

  let reportNode = makeReportNode({ report: report });

  if (report.space) {
    let addToSpace = (item: { node: ReportNode }): ReportNode => {
      let { node } = item;

      if (node.type === 'space') {
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

    if (hasReportNode({ nodes: nodes, reportId: report.reportId })) {
      return nodes;
    }
  }

  return sortReportNodes({ nodes: [...nodes, reportNode] });
}
