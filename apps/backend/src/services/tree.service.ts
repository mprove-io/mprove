import { Injectable } from '@nestjs/common';
import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { makeReportUnitDisplayAccessRoles } from '#common/functions/report-tree';
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
    space: string | undefined;
    displaySpace: string;
  }): ReportUnit {
    let { report, member, favoriteReportIds, space, displaySpace } = item;

    let author = this.getReportAuthor({ report: report });

    return {
      type: 'reportUnit',
      id: report.reportId,
      reportId: report.reportId,
      title: report.title || report.reportId,
      filePath: report.filePath,
      space: space,
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined,
      author: author,
      canEditOrDeleteReport:
        member.isEditor === true ||
        member.isAdmin === true ||
        author === member.alias,
      isFavorite: favoriteReportIds.indexOf(report.reportId) > -1,
      draft: report.draft,
      displaySpace: displaySpace,
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

    let spacesByName = new Map(spaces.map(space => [space.space, space]));

    let nodesBySpace = new Map<string, ReportSpace>();

    let displaySpacesBySpace = new Map<string, string>();

    let myReportsNode: ReportSpace;

    let rootNodes: ReportTreeNode[] = [];

    let uncategorizedReportsNode: ReportSpace;

    let personalReportsNode: ReportSpace;

    let sharedReportsNode: ReportSpace;

    let personalNodesByAuthor = new Map<string, ReportSpace>();

    let sharedNodesByAuthor = new Map<string, ReportSpace>();

    let isAdminOrEditor = member.isAdmin === true || member.isEditor === true;

    let sortedReports = [...reports].sort((a, b) => {
      let aTitle = (a.title || a.reportId).toLowerCase();
      let bTitle = (b.title || b.reportId).toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    sortedReports.forEach(report => {
      let author = this.getReportAuthor({ report: report });

      let reportSpaceName = report.space ?? '';

      if (isDefinedAndNotEmpty(reportSpaceName)) {
        let parts = reportSpaceName.split('.');

        for (let index = 0; index < parts.length; index++) {
          let spaceName = parts.slice(0, index + 1).join('.');

          let space = spacesByName.get(spaceName);

          let existingNode = nodesBySpace.get(spaceName);

          if (isDefined(space) && isUndefined(existingNode)) {
            let spaceNode = this.makeReportSpace({
              space: space,
              title: space.title || parts[index]
            });

            nodesBySpace.set(spaceName, spaceNode);

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

            displaySpacesBySpace.set(spaceName, displaySpace);
          }
        }

        let reportSpaceNode = nodesBySpace.get(reportSpaceName);

        if (isDefined(reportSpaceNode)) {
          let displaySpace = displaySpacesBySpace.get(reportSpaceName) ?? '';

          reportSpaceNode.children.push(
            this.makeReportUnit({
              report: report,
              member: member,
              favoriteReportIds: favoriteReportIds,
              space: reportSpaceName,
              displaySpace: displaySpace
            })
          );
        }

        return;
      }

      if (report.draft === false && author === member.alias) {
        if (isUndefined(myReportsNode)) {
          myReportsNode = this.makeSyntheticReportSpace({
            id: this.myReportsSpaceId,
            title: 'My Reports'
          });
        }

        myReportsNode.children.push(
          this.makeReportUnit({
            report: report,
            member: member,
            favoriteReportIds: favoriteReportIds,
            space: this.myReportsSpaceId,
            displaySpace: 'My Reports'
          })
        );

        return;
      }

      if (report.draft === false && isUndefined(author)) {
        if (isUndefined(uncategorizedReportsNode)) {
          uncategorizedReportsNode = this.makeSyntheticReportSpace({
            id: this.uncategorizedReportsSpaceId,
            title: 'Uncategorized'
          });
        }

        uncategorizedReportsNode.children.push(
          this.makeReportUnit({
            report: report,
            member: member,
            favoriteReportIds: favoriteReportIds,
            space: this.uncategorizedReportsSpaceId,
            displaySpace: 'Uncategorized'
          })
        );

        return;
      }

      if (
        report.draft === false &&
        isAdminOrEditor === true &&
        author !== member.alias &&
        report.accessRoles.length === 0
      ) {
        if (isUndefined(personalReportsNode)) {
          personalReportsNode = this.makeSyntheticReportSpace({
            id: this.personalReportsSpaceId,
            title: 'Personal'
          });
        }

        let authorTitle = author ?? '';

        let authorSpace = `${this.personalReportsSpaceId}/${authorTitle}`;

        let authorNode = personalNodesByAuthor.get(authorTitle);

        if (isUndefined(authorNode)) {
          authorNode = this.makeSyntheticReportSpace({
            id: authorSpace,
            title: authorTitle
          });

          personalNodesByAuthor.set(authorTitle, authorNode);

          personalReportsNode.children.push(authorNode);
        }

        authorNode.children.push(
          this.makeReportUnit({
            report: report,
            member: member,
            favoriteReportIds: favoriteReportIds,
            space: authorSpace,
            displaySpace: `Personal - ${authorTitle}`
          })
        );

        return;
      }

      if (
        report.draft === false &&
        author !== member.alias &&
        report.accessRoles.length > 0
      ) {
        if (isUndefined(sharedReportsNode)) {
          sharedReportsNode = this.makeSyntheticReportSpace({
            id: this.sharedReportsSpaceId,
            title: 'Shared'
          });
        }

        let authorTitle = author ?? '';

        let authorSpace = `${this.sharedReportsSpaceId}/${authorTitle}`;

        let authorNode = sharedNodesByAuthor.get(authorTitle);

        if (isUndefined(authorNode)) {
          authorNode = this.makeSyntheticReportSpace({
            id: authorSpace,
            title: authorTitle
          });

          sharedNodesByAuthor.set(authorTitle, authorNode);

          sharedReportsNode.children.push(authorNode);
        }

        authorNode.children.push(
          this.makeReportUnit({
            report: report,
            member: member,
            favoriteReportIds: favoriteReportIds,
            space: authorSpace,
            displaySpace: `Shared - ${authorTitle}`
          })
        );

        return;
      }

      if (isUndefined(uncategorizedReportsNode)) {
        uncategorizedReportsNode = this.makeSyntheticReportSpace({
          id: this.uncategorizedReportsSpaceId,
          title: 'Uncategorized'
        });
      }

      uncategorizedReportsNode.children.push(
        this.makeReportUnit({
          report: report,
          member: member,
          favoriteReportIds: favoriteReportIds,
          space: this.uncategorizedReportsSpaceId,
          displaySpace: 'Uncategorized'
        })
      );
    });

    let sortedRootNodes = this.sortReportNodes({ nodes: rootNodes });

    let rootSpaceNodes = sortedRootNodes.filter(
      node => node.type === 'reportSpace'
    );

    let nodes: ReportTreeNode[] = [];

    if (isDefined(myReportsNode)) {
      myReportsNode.children = this.sortReportNodes({
        nodes: myReportsNode.children
      });
      nodes.push(myReportsNode);
    }

    nodes.push(...rootSpaceNodes);

    if (isDefined(uncategorizedReportsNode)) {
      uncategorizedReportsNode.children = this.sortReportNodes({
        nodes: uncategorizedReportsNode.children
      });
      nodes.push(uncategorizedReportsNode);
    }

    if (isDefined(personalReportsNode)) {
      personalReportsNode.children = this.sortReportNodes({
        nodes: personalReportsNode.children
      });
      nodes.push(personalReportsNode);
    }

    if (isDefined(sharedReportsNode)) {
      sharedReportsNode.children = this.sortReportNodes({
        nodes: sharedReportsNode.children
      });
      nodes.push(sharedReportsNode);
    }

    return nodes;
  }

  getReportAuthor(item: { report: ReportTab }): string | undefined {
    let { report } = item;

    let author: string;

    if (isDefined(report.filePath)) {
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

  makeReportSpace(item: { space: Space; title: string }): ReportSpace {
    let { space, title } = item;

    return {
      type: 'reportSpace',
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

  makeSyntheticReportSpace(item: { id: string; title: string }): ReportSpace {
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
