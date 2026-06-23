import { Injectable } from '@nestjs/common';
import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { checkAccess } from '#backend/functions/check-access';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import {
  addReportUnitDisplaySpaces,
  makeReportUnitDisplayAccessRoles
} from '#common/functions/report-tree';
import type { Member } from '#common/zod/backend/member';
import type { ReportSpace } from '#common/zod/backend/report-space';
import type { ReportTreeNode } from '#common/zod/backend/report-tree-node';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { Space } from '#common/zod/blockml/space';

@Injectable()
export class TreeService {
  myReportsSpaceId = '__my_reports__';
  uncategorizedReportsSpaceId = '__uncategorized_reports__';
  personalReportsSpaceId = '__personal_reports__';
  sharedReportsSpaceId = '__shared_reports__';

  makeReportUnit(item: {
    report: ReportTab;
    member: Member;
    favoriteReportIds: string[];
    space?: string;
  }): ReportUnit {
    let { report, member, favoriteReportIds, space } = item;
    let author = this.getReportAuthor({ report: report });

    return {
      type: 'reportUnit',
      id: report.reportId,
      reportId: report.reportId,
      title: report.title || report.reportId,
      filePath: report.filePath,
      space: space ?? report.space,
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined,
      author: author,
      canEditOrDeleteReport:
        member.isEditor === true ||
        member.isAdmin === true ||
        author === member.alias,
      isFavorite: favoriteReportIds.indexOf(report.reportId) > -1,
      draft: report.draft,
      displaySpace: space ?? report.space ?? '',
      displayAccessRoles: makeReportUnitDisplayAccessRoles({
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      })
    };
  }

  makeReportNodes(item: {
    spaces: Space[];
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportTreeNode[] {
    let { spaces, reports, member, favoriteReportIds } = item;

    let nodes = this.makeBaseReportNodes({
      spaces: spaces,
      reports: reports,
      member: member,
      favoriteReportIds: favoriteReportIds
    });

    nodes = this.addMyReportsNode({
      nodes: nodes,
      reports: reports,
      member: member,
      favoriteReportIds: favoriteReportIds
    });

    nodes = this.addUncategorizedReportsNode({
      nodes: nodes,
      reports: reports,
      member: member,
      favoriteReportIds: favoriteReportIds
    });

    nodes =
      member.isAdmin === true || member.isEditor === true
        ? this.addPersonalReportsNode({
            nodes: nodes,
            reports: reports,
            member: member,
            favoriteReportIds: favoriteReportIds
          })
        : nodes;

    nodes = this.addSharedReportsNode({
      nodes: nodes,
      reports: reports,
      member: member,
      favoriteReportIds: favoriteReportIds
    });

    nodes = this.pruneEmptySpaceNodes({ nodes: nodes });

    return addReportUnitDisplaySpaces({
      reportNodes: nodes,
      pathParts: []
    });
  }

  makeBaseReportNodes(item: {
    spaces: Space[];
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportTreeNode[] {
    let { spaces, reports, member, favoriteReportIds } = item;

    let isShowAllSpaces = member.isAdmin === true || member.isEditor === true;

    let directlyVisibleSpaces = spaces.filter(space => {
      if (isShowAllSpaces === true) {
        return true;
      }

      let hasVisibleReport = reports.some(
        report => report.space === space.space
      );

      if (hasVisibleReport === true) {
        return true;
      }

      let hasAccess = checkAccess({
        member: member,
        accessRoles: space.accessRolesCombined
      });

      return hasAccess;
    });

    let spacesByName = new Map(spaces.map(space => [space.space, space]));
    let visibleSpaceNames = new Set(
      directlyVisibleSpaces.map(space => space.space)
    );

    directlyVisibleSpaces.forEach(space => {
      let parts = space.space.split('.');
      parts.pop();

      while (parts.length > 0) {
        let parentSpaceName = parts.join('.');
        let parentSpace = spacesByName.get(parentSpaceName);
        let isParentSpaceDefined = isDefined(parentSpace);

        if (isParentSpaceDefined === true) {
          visibleSpaceNames.add(parentSpace.space);
        }

        parts.pop();
      }
    });

    let visibleSpaces = spaces.filter(space =>
      visibleSpaceNames.has(space.space)
    );

    let nodesBySpace = new Map<string, ReportTreeNode>();

    visibleSpaces
      .sort((a, b) => (a.space > b.space ? 1 : b.space > a.space ? -1 : 0))
      .forEach(space => {
        let parts = space.space.split('.');

        nodesBySpace.set(space.space, {
          type: 'reportSpace',
          id: space.space,
          space: space.space,
          filePath: space.filePath,
          title: space.title || parts[parts.length - 1],
          accessRoles: space.accessRoles,
          accessRolesCombined: space.accessRolesCombined,
          isSynthetic: false,
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
        let reportNode = this.makeReportNode({
          report: report,
          member: member,
          favoriteReportIds: favoriteReportIds
        });

        let reportSpaceNode = isDefined(report.space)
          ? nodesBySpace.get(report.space)
          : undefined;
        let isReportSpaceNodeDefined = isDefined(reportSpaceNode);

        if (isReportSpaceNodeDefined === true) {
          let reportSpace = reportSpaceNode as ReportSpace;

          if (reportSpace.type === 'reportSpace') {
            reportSpace.children.push(reportNode);
          }
        }
      });

    let rootNodes: ReportTreeNode[] = reports
      .filter(report => isDefined(report.space) === false)
      .map(report =>
        this.makeReportNode({
          report: report,
          member: member,
          favoriteReportIds: favoriteReportIds
        })
      );

    visibleSpaces.forEach(space => {
      let node = nodesBySpace.get(space.space);
      let parts = space.space.split('.');
      parts.pop();
      let parentSpace = parts.length > 0 ? parts.join('.') : undefined;
      let parentNode = isDefined(parentSpace)
        ? nodesBySpace.get(parentSpace)
        : undefined;
      let isParentNodeDefined = isDefined(parentNode);
      let isNodeDefined = isDefined(node);

      if (isParentNodeDefined === true && isNodeDefined === true) {
        let parentSpaceNode = parentNode as ReportSpace;
        let childNode = node as ReportTreeNode;

        if (parentSpaceNode.type === 'reportSpace') {
          parentSpaceNode.children.push(childNode);
        }
      } else if (isNodeDefined === true) {
        let rootNode = node as ReportTreeNode;
        rootNodes.push(rootNode);
      }
    });

    return this.sortReportNodes({ nodes: rootNodes });
  }

  makeReportNode(item: {
    report: ReportTab;
    member: Member;
    favoriteReportIds: string[];
    space?: string;
  }): ReportTreeNode {
    let { report, member, favoriteReportIds, space } = item;
    let reportUnit = this.makeReportUnit({
      report: report,
      member: member,
      favoriteReportIds: favoriteReportIds,
      space: space
    });

    return reportUnit;
  }

  getReportAuthor(item: { report: ReportTab }) {
    let { report } = item;
    let author: string;
    let isFilePathDefined = isDefined(report.filePath);

    if (isFilePathDefined) {
      let filePathArray = report.filePath.split('/');

      let usersFolderIndex = filePathArray.findIndex(
        x => x === MPROVE_USERS_FOLDER
      );

      author =
        usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
          ? filePathArray[usersFolderIndex + 1]
          : undefined;
    }

    return author;
  }

  addMyReportsNode(item: {
    nodes: ReportTreeNode[];
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportTreeNode[] {
    let { nodes, reports, member, favoriteReportIds } = item;
    let alias = member.alias;
    let isAliasDefined = isDefinedAndNotEmpty(alias);

    if (isAliasDefined === false) {
      return nodes;
    }

    let myReports = reports.filter(report => {
      let author = this.getReportAuthor({ report: report });

      return (
        report.draft === false &&
        author === alias &&
        isDefinedAndNotEmpty(report.space) === false
      );
    });

    if (myReports.length === 0) {
      return nodes;
    }

    let myReportIds = myReports.map(report => report.reportId);
    let nodesWithoutMyReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: myReportIds
    });

    let myReportsNode: ReportTreeNode = {
      type: 'reportSpace',
      id: this.myReportsSpaceId,
      space: this.myReportsSpaceId,
      filePath: '',
      title: 'My Reports',
      accessRoles: [],
      accessRolesCombined: [],
      isSynthetic: true,
      children: this.sortReportNodes({
        nodes: myReports.map(report =>
          this.makeReportNode({
            report: report,
            member: member,
            favoriteReportIds: favoriteReportIds,
            space: this.myReportsSpaceId
          })
        )
      })
    };

    return [myReportsNode, ...nodesWithoutMyReports];
  }

  addUncategorizedReportsNode(item: {
    nodes: ReportTreeNode[];
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportTreeNode[] {
    let { nodes, reports, member, favoriteReportIds } = item;

    let uncategorizedReports = reports.filter(report => {
      let author = this.getReportAuthor({ report: report });
      let isNotDraft = report.draft === false;
      let hasAuthor = isDefinedAndNotEmpty(author);
      let hasNoSpace = isDefinedAndNotEmpty(report.space) === false;

      return isNotDraft && hasAuthor === false && hasNoSpace;
    });

    if (uncategorizedReports.length === 0) {
      return nodes;
    }

    let uncategorizedReportIds = uncategorizedReports.map(
      report => report.reportId
    );

    let nodesWithoutUncategorizedReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: uncategorizedReportIds
    });

    let uncategorizedReportsNode = this.makeSyntheticSpaceNode({
      id: this.uncategorizedReportsSpaceId,
      title: 'Uncategorized'
    });

    uncategorizedReportsNode.children = this.sortReportNodes({
      nodes: uncategorizedReports.map(report =>
        this.makeReportNode({
          report: report,
          member: member,
          favoriteReportIds: favoriteReportIds,
          space: this.uncategorizedReportsSpaceId
        })
      )
    });

    return this.insertAfterLastSpace({
      nodes: nodesWithoutUncategorizedReports,
      node: uncategorizedReportsNode
    });
  }

  addSharedReportsNode(item: {
    nodes: ReportTreeNode[];
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportTreeNode[] {
    let { nodes, reports, member, favoriteReportIds } = item;
    let alias = member.alias;

    let sharedReports = reports.filter(report => {
      let author = this.getReportAuthor({ report: report });
      let isNotDraft = report.draft === false;
      let hasAuthor = isDefinedAndNotEmpty(author);
      let isNotMyReport = hasAuthor === true && author !== alias;
      let hasNoSpace = isDefinedAndNotEmpty(report.space) === false;
      let hasAccessRoles = report.accessRoles.length > 0;

      return (
        isNotDraft && hasAuthor && isNotMyReport && hasNoSpace && hasAccessRoles
      );
    });

    if (sharedReports.length === 0) {
      return nodes;
    }

    let sharedReportIds = sharedReports.map(report => report.reportId);

    let nodesWithoutSharedReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: sharedReportIds
    });

    let sharedReportsNode = this.makeReportsByAuthorSyntheticNode({
      id: this.sharedReportsSpaceId,
      title: 'Shared',
      reports: sharedReports,
      member: member,
      favoriteReportIds: favoriteReportIds
    });

    return this.insertAfterLastSpace({
      nodes: nodesWithoutSharedReports,
      node: sharedReportsNode
    });
  }

  addPersonalReportsNode(item: {
    nodes: ReportTreeNode[];
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportTreeNode[] {
    let { nodes, reports, member, favoriteReportIds } = item;
    let alias = member.alias;

    let personalReports = reports.filter(report => {
      let author = this.getReportAuthor({ report: report });
      let isNotDraft = report.draft === false;
      let hasAuthor = isDefinedAndNotEmpty(author);
      let isNotMyReport = hasAuthor === true && author !== alias;
      let hasNoSpace = isDefinedAndNotEmpty(report.space) === false;
      let hasNoAccessRoles = report.accessRoles.length === 0;

      return (
        isNotDraft &&
        hasAuthor &&
        isNotMyReport &&
        hasNoSpace &&
        hasNoAccessRoles
      );
    });

    if (personalReports.length === 0) {
      return nodes;
    }

    let personalReportIds = personalReports.map(report => report.reportId);

    let nodesWithoutPersonalReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: personalReportIds
    });

    let personalReportsNode = this.makeReportsByAuthorSyntheticNode({
      id: this.personalReportsSpaceId,
      title: 'Personal',
      reports: personalReports,
      member: member,
      favoriteReportIds: favoriteReportIds
    });

    return this.insertAfterLastSpace({
      nodes: nodesWithoutPersonalReports,
      node: personalReportsNode
    });
  }

  makeReportsByAuthorSyntheticNode(item: {
    id: string;
    title: string;
    reports: ReportTab[];
    member: Member;
    favoriteReportIds: string[];
  }): ReportSpace {
    let { id, title, reports, member, favoriteReportIds } = item;
    let rootNode = this.makeSyntheticSpaceNode({ id: id, title: title });

    reports
      .sort((a, b) => {
        let aTitle = (a.title || a.reportId).toLowerCase();
        let bTitle = (b.title || b.reportId).toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
      .forEach(report => {
        let author = this.getReportAuthor({ report: report });
        let authorTitle = author ?? '';
        let displaySpace = `${id}/${authorTitle}`;

        let authorNode = rootNode.children.find(
          child => child.type === 'reportSpace' && child.id === displaySpace
        ) as ReportSpace | undefined;
        let isAuthorNodeDefined = isDefined(authorNode);

        if (isAuthorNodeDefined === false) {
          authorNode = this.makeSyntheticSpaceNode({
            id: displaySpace,
            title: authorTitle
          });
          rootNode.children.push(authorNode);
        }

        authorNode.children.push(
          this.makeReportNode({
            report: report,
            member: member,
            favoriteReportIds: favoriteReportIds,
            space: displaySpace
          })
        );
      });

    rootNode.children = this.sortReportNodes({ nodes: rootNode.children });

    return rootNode;
  }

  makeSyntheticSpaceNode(item: { id: string; title: string }): ReportSpace {
    let { id, title } = item;

    return {
      type: 'reportSpace',
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

  insertAfterLastSpace(item: {
    nodes: ReportTreeNode[];
    node: ReportTreeNode;
  }): ReportTreeNode[] {
    let { nodes, node } = item;
    let lastSpaceIndex = -1;

    nodes.forEach((x, index) => {
      if (x.type === 'reportSpace') {
        lastSpaceIndex = index;
      }
    });

    if (lastSpaceIndex < 0) {
      return [node, ...nodes];
    }

    return [
      ...nodes.slice(0, lastSpaceIndex + 1),
      node,
      ...nodes.slice(lastSpaceIndex + 1)
    ];
  }

  pruneEmptySpaceNodes(item: { nodes: ReportTreeNode[] }): ReportTreeNode[] {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'reportUnit') {
          return node;
        }

        return {
          ...node,
          children: this.pruneEmptySpaceNodes({ nodes: node.children ?? [] })
        };
      })
      .filter(node => {
        if (node.type === 'reportUnit') {
          return true;
        }

        return node.children.length > 0;
      });
  }

  removeReportNodes(item: {
    nodes: ReportTreeNode[];
    reportIds: string[];
  }): ReportTreeNode[] {
    let { nodes, reportIds } = item;

    return nodes
      .map(node => {
        if (node.type === 'reportUnit') {
          return node;
        }

        return {
          ...node,
          children: this.removeReportNodes({
            nodes: node.children ?? [],
            reportIds: reportIds
          })
        };
      })
      .filter(node => {
        if (node.type === 'reportSpace') {
          return true;
        }

        return reportIds.includes(node.reportId) === false;
      });
  }

  sortReportNodes(item: { nodes: ReportTreeNode[] }): ReportTreeNode[] {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'reportSpace') {
          return {
            ...node,
            children: this.sortReportNodes({ nodes: node.children ?? [] })
          };
        }

        return node;
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'reportSpace' ? -1 : 1;
        }

        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      });
  }
}
