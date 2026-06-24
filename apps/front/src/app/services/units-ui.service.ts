import { Injectable } from '@angular/core';
import { makeCopy } from '#common/functions/make-copy';
import { addDisplaySpace } from '#common/functions/space/add-display-space';
import { addMissingSyntheticSpaceUnitTarget } from '#common/functions/space/add-missing-synthetic-space-unit-target';
import { addSpaceUnitToExistingSpace } from '#common/functions/space/add-space-unit-to-existing-space';
import { getSpaceUnit } from '#common/functions/space/get-space-unit';
import { makeDisplayAccessRoles } from '#common/functions/space/make-display-access-roles';
import { makeSpaceUnitTarget } from '#common/functions/space/make-space-unit-target';
import { sortSpaceNodes } from '#common/functions/space/sort-space-nodes';
import type { Member } from '#common/zod/backend/member';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ReportX } from '#common/zod/backend/report-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { SpaceUnitX } from '#common/zod/backend/space-unit-x';

@Injectable({ providedIn: 'root' })
export class UnitsUiService {
  spaceUnitToSpaceUnitX(item: {
    spaceUnit: SpaceUnit;
    isMatched?: boolean;
  }): SpaceUnitX {
    let { spaceUnit, isMatched } = item;

    return {
      ...spaceUnit,
      isMatched: isMatched
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
    member: Member;
  }): SpaceNode[] {
    let { spaceNodes, report, member } = item;
    let isFavorite = this.getSpaceUnitFavorite({
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

    let target = makeSpaceUnitTarget({
      space: report.space,
      author: report.author,
      accessRoles: report.accessRoles,
      member: member
    });
    let targetSpace = target.space;

    let reportNode = {
      ...this.makeSpaceUnitFromReportX({
        report: report,
        isFavorite: isFavorite
      }),
      space: targetSpace
    };

    if (targetSpace) {
      nodes = addSpaceUnitToExistingSpace({
        nodes: nodes,
        space: targetSpace,
        spaceUnit: reportNode
      });

      if (this.hasSpaceUnit({ nodes: nodes, unitId: report.reportId })) {
        return addDisplaySpace({ spaceNodes: nodes, pathParts: [] });
      }

      if (target.isSynthetic === true) {
        let withSyntheticTarget = addMissingSyntheticSpaceUnitTarget({
          nodes: nodes,
          target: target,
          spaceUnit: reportNode
        });

        return addDisplaySpace({
          spaceNodes: withSyntheticTarget,
          pathParts: []
        });
      }
    }

    return addDisplaySpace({
      spaceNodes: sortSpaceNodes({ nodes: [...nodes, reportNode] }),
      pathParts: []
    });
  }

  private getSpaceUnitFavorite(item: {
    spaceNodes: SpaceNode[];
    unitId: string;
  }): boolean {
    let { spaceNodes, unitId } = item;

    let spaceUnit = getSpaceUnit({
      spaceNodes: spaceNodes,
      unitId: unitId
    });

    return spaceUnit?.isFavorite === true;
  }

  private hasSpaceUnit(item: { nodes: SpaceNode[]; unitId: string }): boolean {
    let { nodes, unitId } = item;

    let spaceUnit = getSpaceUnit({ spaceNodes: nodes, unitId: unitId });

    return spaceUnit !== undefined;
  }
}
