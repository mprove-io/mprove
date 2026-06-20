import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { checkAccess } from '#backend/functions/check-access';
import { isDefined } from '#common/functions/is-defined';
import type { Member } from '#common/zod/backend/member';
import type { ReportNode } from '#common/zod/backend/report-node';
import type { Space } from '#common/zod/blockml/space';

export function makeReportNodes(item: {
  spaces: Space[];
  reports: ReportTab[];
  member: Member;
}): ReportNode[] {
  let { spaces, reports, member } = item;

  let sortReportNodes = (item: { nodes: ReportNode[] }): ReportNode[] => {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'space') {
          node.children = sortReportNodes({ nodes: node.children });
        }

        return node;
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'space' ? -1 : 1;
        }

        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      });
  };

  let pruneEmptySpaceNodes = (item: { nodes: ReportNode[] }): ReportNode[] => {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'report') {
          return node;
        }

        node.children = pruneEmptySpaceNodes({ nodes: node.children });

        return node;
      })
      .filter(node => {
        if (node.type === 'report') {
          return true;
        }

        return node.children.length > 0;
      });
  };

  let isShowAllSpaces = member.isAdmin === true || member.isEditor === true;

  let visibleSpaces = spaces.filter(space => {
    if (isShowAllSpaces === true) {
      return true;
    }

    let hasAccess = checkAccess({
      member: member,
      accessRoles: space.accessRolesCombined
    });

    return hasAccess;
  });

  let nodesBySpace = new Map<string, ReportNode>();

  visibleSpaces
    .sort((a, b) => (a.space > b.space ? 1 : b.space > a.space ? -1 : 0))
    .forEach(space => {
      let parts = space.space.split('.');

      nodesBySpace.set(space.space, {
        type: 'space',
        id: space.space,
        space: space.space,
        filePath: space.filePath,
        title: space.title || parts[parts.length - 1],
        accessRoles: space.accessRoles,
        accessRolesCombined: space.accessRolesCombined,
        children: []
      });
    });

  reports
    .sort((a, b) => {
      let aTitle = (a.title || a.reportId).toLowerCase();
      let bTitle = (b.title || b.reportId).toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    })
    .forEach(report => {
      let reportNode: ReportNode = {
        type: 'report',
        id: report.reportId,
        reportId: report.reportId,
        title: report.title || report.reportId,
        space: report.space,
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      };

      let reportSpaceNode = isDefined(report.space)
        ? nodesBySpace.get(report.space)
        : undefined;

      if (isDefined(reportSpaceNode) && reportSpaceNode.type === 'space') {
        reportSpaceNode.children.push(reportNode);
      }
    });

  let rootNodes: ReportNode[] = reports
    .filter(report => isDefined(report.space) === false)
    .map(report => {
      let reportNode: ReportNode = {
        type: 'report',
        id: report.reportId,
        reportId: report.reportId,
        title: report.title || report.reportId,
        space: report.space,
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      };
      return reportNode;
    });

  visibleSpaces.forEach(space => {
    let node = nodesBySpace.get(space.space);
    let parts = space.space.split('.');
    parts.pop();
    let parentSpace = parts.length > 0 ? parts.join('.') : undefined;
    let parentNode = isDefined(parentSpace)
      ? nodesBySpace.get(parentSpace)
      : undefined;

    if (isDefined(parentNode) && parentNode.type === 'space') {
      parentNode.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  let sortedNodes = sortReportNodes({ nodes: rootNodes });

  return pruneEmptySpaceNodes({ nodes: sortedNodes });
}
