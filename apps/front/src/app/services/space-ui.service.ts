import { Injectable } from '@angular/core';
import { MY_UNITS_SPACE_ID, MY_UNITS_TITLE } from '#common/constants/top';
import { makeCopy } from '#common/functions/make-copy';
import { addDisplaySpace } from '#common/functions/space/add-display-space';
import { makeDisplayAccessRoles } from '#common/functions/space/make-display-access-roles';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ReportX } from '#common/zod/backend/report-x';
import type { SpaceFolder } from '#common/zod/backend/space-folder';
import type { SpaceFolderX } from '#common/zod/backend/space-folder-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceNodeX } from '#common/zod/backend/space-node-x';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { SpaceUnitX } from '#common/zod/backend/space-unit-x';

@Injectable({ providedIn: 'root' })
export class SpaceUiService {
  private makeMyUnitsSpace(item: {
    children: SpaceNode[];
  }): Extract<SpaceNode, { type: 'spaceFolder' }> {
    let { children } = item;

    return {
      type: 'spaceFolder' as const,
      id: MY_UNITS_SPACE_ID,
      space: MY_UNITS_SPACE_ID,
      filePath: '',
      title: MY_UNITS_TITLE,
      accessRoles: [],
      accessRolesCombined: [],
      isSynthetic: true,
      children: children
    };
  }

  makeSpaceUnitFromReportX(item: {
    report: ReportX;
    isFavorite?: boolean;
  }): SpaceUnit {
    let { report, isFavorite } = item;

    return {
      type: 'spaceUnit',
      id: report.reportId,
      unitId: report.reportId,
      title: report.title || report.reportId,
      filePath: report.filePath,
      space: report.space,
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined,
      author: report.author,
      canEditOrDeleteUnit: report.canEditOrDeleteReport === true,
      isFavorite: isFavorite === true,
      displaySpace: report.space ?? '',
      displayAccessRoles: makeDisplayAccessRoles({
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      })
    };
  }

  makeReportUnitFromReportX(item: {
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
      displayAccessRoles: makeDisplayAccessRoles({
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      })
    };
  }

  spaceUnitToReportUnit(item: { spaceUnit: SpaceUnit }): ReportUnit {
    let { spaceUnit } = item;

    return {
      type: 'reportUnit',
      id: spaceUnit.id,
      reportId: spaceUnit.unitId,
      title: spaceUnit.title,
      filePath: spaceUnit.filePath,
      space: spaceUnit.space,
      accessRoles: spaceUnit.accessRoles,
      accessRolesCombined: spaceUnit.accessRolesCombined,
      author: spaceUnit.author,
      canEditOrDeleteReport: spaceUnit.canEditOrDeleteUnit,
      isFavorite: spaceUnit.isFavorite,
      draft: false,
      displaySpace: spaceUnit.displaySpace,
      displayAccessRoles: spaceUnit.displayAccessRoles
    };
  }

  private spaceUnitToSpaceUnitX(item: {
    spaceUnit: SpaceUnit;
    isMatched?: boolean;
  }): SpaceUnitX {
    let { spaceUnit, isMatched } = item;

    return {
      ...spaceUnit,
      isMatched: isMatched
    };
  }

  private spaceFolderToSpaceFolderX(item: {
    spaceFolder: SpaceFolder;
    children: SpaceNodeX[];
    isMatched?: boolean;
    isSelectedAncestor?: boolean;
  }): SpaceFolderX {
    let { spaceFolder, children, isMatched, isSelectedAncestor } = item;

    return {
      ...spaceFolder,
      children: children,
      isMatched: isMatched,
      isSelectedAncestor: isSelectedAncestor
    };
  }

  private sortSpaceNodes(item: { nodes: SpaceNode[] }) {
    let { nodes } = item;

    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'spaceFolder' ? -1 : 1;
      }

      let aTitle = a.title.toLowerCase();
      let bTitle = b.title.toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });
  }

  removeSpaceUnit(item: {
    spaceNodes: SpaceNode[];
    unitId: string;
  }): SpaceNode[] {
    let { spaceNodes, unitId } = item;

    return makeCopy(spaceNodes ?? [])
      .map((node: SpaceNode) => {
        if (node.type === 'spaceFolder') {
          node.children = this.removeSpaceUnit({
            spaceNodes: node.children,
            unitId: unitId
          });
        }

        return node;
      })
      .filter((node: SpaceNode) =>
        node.type === 'spaceUnit' ? node.unitId !== unitId : true
      );
  }

  private getSpaceUnitFavorite(item: {
    spaceNodes: SpaceNode[];
    unitId: string;
  }): boolean {
    let { spaceNodes, unitId } = item;

    return (spaceNodes ?? []).some(node => {
      if (node.type === 'spaceUnit') {
        return node.unitId === unitId && node.isFavorite === true;
      }

      return this.getSpaceUnitFavorite({
        spaceNodes: node.children ?? [],
        unitId: unitId
      });
    });
  }

  private getSpaceUnit(item: {
    spaceNodes: SpaceNode[];
    unitId: string;
  }): SpaceUnit | undefined {
    let { spaceNodes, unitId } = item;
    let foundSpaceUnit: SpaceUnit | undefined;

    (spaceNodes ?? []).some(node => {
      if (node.type === 'spaceUnit') {
        foundSpaceUnit = node.unitId === unitId ? node : undefined;

        return foundSpaceUnit !== undefined;
      }

      foundSpaceUnit = this.getSpaceUnit({
        spaceNodes: node.children ?? [],
        unitId: unitId
      });

      return foundSpaceUnit !== undefined;
    });

    return foundSpaceUnit;
  }

  updateSpaceUnitFavorite(item: {
    spaceNodes: SpaceNode[];
    unitId: string;
    isFavorite: boolean;
  }): SpaceNode[] {
    let { spaceNodes, unitId, isFavorite } = item;

    return makeCopy(spaceNodes ?? []).map(node => {
      if (node.type === 'spaceUnit') {
        return node.unitId === unitId
          ? {
              ...node,
              isFavorite: isFavorite
            }
          : node;
      }

      return {
        ...node,
        children: this.updateSpaceUnitFavorite({
          spaceNodes: node.children ?? [],
          unitId: unitId,
          isFavorite: isFavorite
        })
      };
    });
  }

  upsertSpaceUnit(item: {
    spaceNodes: SpaceNode[];
    report: ReportX;
  }): SpaceNode[] {
    let { spaceNodes, report } = item;
    let isFavorite = this.getSpaceUnitFavorite({
      spaceNodes: spaceNodes,
      unitId: report.reportId
    });

    let existingSpaceUnit = this.getSpaceUnit({
      spaceNodes: spaceNodes,
      unitId: report.reportId
    });

    let nodes = this.removeSpaceUnit({
      spaceNodes: spaceNodes,
      unitId: report.reportId
    });

    if (report.draft === true) {
      return nodes;
    }

    let targetSpace =
      report.space ?? existingSpaceUnit?.space ?? MY_UNITS_SPACE_ID;

    let reportNode = {
      ...this.makeSpaceUnitFromReportX({
        report: report,
        isFavorite: isFavorite
      }),
      space: targetSpace
    };

    if (targetSpace) {
      let addToSpace = (item: { node: SpaceNode }): SpaceNode => {
        let { node } = item;

        if (node.type === 'spaceFolder') {
          if (node.space === targetSpace) {
            node.children = this.sortSpaceNodes({
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

      if (this.hasSpaceUnit({ nodes: nodes, unitId: report.reportId })) {
        return addDisplaySpace({ spaceNodes: nodes, pathParts: [] });
      }

      if (targetSpace === MY_UNITS_SPACE_ID) {
        return addDisplaySpace({
          spaceNodes: [
            this.makeMyUnitsSpace({
              children: this.sortSpaceNodes({ nodes: [reportNode] })
            }),
            ...nodes
          ],
          pathParts: []
        });
      }
    }

    return addDisplaySpace({
      spaceNodes: this.sortSpaceNodes({ nodes: [...nodes, reportNode] }),
      pathParts: []
    });
  }

  private hasSpaceUnit(item: { nodes: SpaceNode[]; unitId: string }): boolean {
    let { nodes, unitId } = item;

    return nodes.some(node => {
      if (node.type === 'spaceUnit') {
        return node.unitId === unitId;
      }

      return this.hasSpaceUnit({ nodes: node.children, unitId: unitId });
    });
  }

  pruneEmptySpaceNodes(item: { nodes: SpaceNode[] }): SpaceNode[] {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'spaceUnit') {
          return node;
        }

        return {
          ...node,
          children: this.pruneEmptySpaceNodes({ nodes: node.children ?? [] })
        };
      })
      .filter(node => {
        if (node.type === 'spaceUnit') {
          return true;
        }

        return node.children.length > 0;
      });
  }

  makeVisibleSpaceNodes(item: {
    nodes: SpaceNode[];
    reportMatchedIds?: Set<string>;
  }): SpaceNodeX[] {
    let { nodes, reportMatchedIds } = item;
    let visibleNodes: SpaceNodeX[] = [];

    (nodes ?? []).forEach(node => {
      if (node.type === 'spaceUnit') {
        let isReportMatched =
          reportMatchedIds === undefined
            ? true
            : reportMatchedIds.has(node.unitId);

        if (isReportMatched === true) {
          visibleNodes.push(
            this.spaceUnitToSpaceUnitX({
              spaceUnit: node,
              isMatched: true
            })
          );
        }

        return;
      }

      let children = this.makeVisibleSpaceNodes({
        nodes: node.children ?? [],
        reportMatchedIds: reportMatchedIds
      });

      if (children.length > 0) {
        visibleNodes.push(
          this.spaceFolderToSpaceFolderX({
            spaceFolder: node,
            children: children,
            isMatched: true
          })
        );
      }
    });

    return visibleNodes;
  }

  markSelectedAncestors(item: {
    nodes: SpaceNodeX[];
    selectedReportId: string;
  }): SpaceNodeX[] {
    let { nodes, selectedReportId } = item;

    return nodes.map(node => {
      if (node.type === 'spaceUnit') {
        return node;
      }

      let children = this.markSelectedAncestors({
        nodes: node.children ?? [],
        selectedReportId: selectedReportId
      });

      let isSelectedAncestor = children.some(child =>
        child.type === 'spaceUnit'
          ? child.unitId === selectedReportId
          : child.isSelectedAncestor === true
      );

      return this.spaceFolderToSpaceFolderX({
        spaceFolder: node,
        children: children,
        isMatched: node.isMatched,
        isSelectedAncestor: isSelectedAncestor
      });
    });
  }

  flattenFavoriteSpaceNodes(item: { nodes: SpaceNodeX[] }): SpaceNodeX[] {
    let { nodes } = item;

    return nodes.reduce((acc: SpaceNodeX[], node) => {
      if (node.type === 'spaceUnit') {
        if (node.isFavorite === true) {
          acc.push(
            this.spaceUnitToSpaceUnitX({
              spaceUnit: node,
              isMatched: true
            })
          );
        }

        return acc;
      }

      let children = this.flattenFavoriteSpaceNodes({
        nodes: node.children ?? []
      });

      acc.push(...children);

      return acc;
    }, []);
  }
}
