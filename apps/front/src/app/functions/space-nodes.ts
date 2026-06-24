import { MY_UNITS_SPACE_ID, MY_UNITS_TITLE } from '#common/constants/top';
import { makeCopy } from '#common/functions/make-copy';
import {
  addSpaceUnitDisplaySpaces,
  makeSpaceUnitDisplayAccessRoles
} from '#common/functions/space-tree';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ReportX } from '#common/zod/backend/report-x';
import type { SpaceFolder } from '#common/zod/backend/space-folder';
import type { SpaceFolderX } from '#common/zod/backend/space-folder-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceNodeX } from '#common/zod/backend/space-node-x';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import type { SpaceUnitX } from '#common/zod/backend/space-unit-x';

function makeMyUnitsSpace(item: {
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

export function makeSpaceUnitFromReportX(item: {
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
    displayAccessRoles: makeSpaceUnitDisplayAccessRoles({
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined
    })
  };
}

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
    displayAccessRoles: makeSpaceUnitDisplayAccessRoles({
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined
    })
  };
}

export function spaceUnitToReportUnit(item: {
  spaceUnit: SpaceUnit;
}): ReportUnit {
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

function spaceUnitToSpaceUnitX(item: {
  spaceUnit: SpaceUnit;
  isMatched?: boolean;
}): SpaceUnitX {
  let { spaceUnit, isMatched } = item;

  return {
    ...spaceUnit,
    isMatched: isMatched
  };
}

function spaceFolderToSpaceFolderX(item: {
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

function sortSpaceNodes(item: { nodes: SpaceNode[] }) {
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

export function removeSpaceUnit(item: {
  spaceNodes: SpaceNode[];
  unitId: string;
}): SpaceNode[] {
  let { spaceNodes, unitId } = item;

  return makeCopy(spaceNodes ?? [])
    .map((node: SpaceNode) => {
      if (node.type === 'spaceFolder') {
        node.children = removeSpaceUnit({
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

function getSpaceUnitFavorite(item: {
  spaceNodes: SpaceNode[];
  unitId: string;
}): boolean {
  let { spaceNodes, unitId } = item;

  return (spaceNodes ?? []).some(node => {
    if (node.type === 'spaceUnit') {
      return node.unitId === unitId && node.isFavorite === true;
    }

    return getSpaceUnitFavorite({
      spaceNodes: node.children ?? [],
      unitId: unitId
    });
  });
}

function getSpaceUnit(item: {
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

    foundSpaceUnit = getSpaceUnit({
      spaceNodes: node.children ?? [],
      unitId: unitId
    });

    return foundSpaceUnit !== undefined;
  });

  return foundSpaceUnit;
}

export function updateSpaceUnitFavorite(item: {
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
      children: updateSpaceUnitFavorite({
        spaceNodes: node.children ?? [],
        unitId: unitId,
        isFavorite: isFavorite
      })
    };
  });
}

export function upsertSpaceUnit(item: {
  spaceNodes: SpaceNode[];
  report: ReportX;
}): SpaceNode[] {
  let { spaceNodes, report } = item;
  let isFavorite = getSpaceUnitFavorite({
    spaceNodes: spaceNodes,
    unitId: report.reportId
  });

  let existingSpaceUnit = getSpaceUnit({
    spaceNodes: spaceNodes,
    unitId: report.reportId
  });

  let nodes = removeSpaceUnit({
    spaceNodes: spaceNodes,
    unitId: report.reportId
  });

  if (report.draft === true) {
    return nodes;
  }

  let targetSpace =
    report.space ?? existingSpaceUnit?.space ?? MY_UNITS_SPACE_ID;

  let reportNode = {
    ...makeSpaceUnitFromReportX({
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
          node.children = sortSpaceNodes({
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

    if (hasSpaceUnit({ nodes: nodes, unitId: report.reportId })) {
      return addSpaceUnitDisplaySpaces({ spaceNodes: nodes, pathParts: [] });
    }

    if (targetSpace === MY_UNITS_SPACE_ID) {
      return addSpaceUnitDisplaySpaces({
        spaceNodes: [
          makeMyUnitsSpace({
            children: sortSpaceNodes({ nodes: [reportNode] })
          }),
          ...nodes
        ],
        pathParts: []
      });
    }
  }

  return addSpaceUnitDisplaySpaces({
    spaceNodes: sortSpaceNodes({ nodes: [...nodes, reportNode] }),
    pathParts: []
  });
}

function hasSpaceUnit(item: { nodes: SpaceNode[]; unitId: string }): boolean {
  let { nodes, unitId } = item;

  return nodes.some(node => {
    if (node.type === 'spaceUnit') {
      return node.unitId === unitId;
    }

    return hasSpaceUnit({ nodes: node.children, unitId: unitId });
  });
}

export function pruneEmptySpaceNodes(item: {
  nodes: SpaceNode[];
}): SpaceNode[] {
  let { nodes } = item;

  return nodes
    .map(node => {
      if (node.type === 'spaceUnit') {
        return node;
      }

      return {
        ...node,
        children: pruneEmptySpaceNodes({ nodes: node.children ?? [] })
      };
    })
    .filter(node => {
      if (node.type === 'spaceUnit') {
        return true;
      }

      return node.children.length > 0;
    });
}

export function makeVisibleSpaceNodes(item: {
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
          spaceUnitToSpaceUnitX({
            spaceUnit: node,
            isMatched: true
          })
        );
      }

      return;
    }

    let children = makeVisibleSpaceNodes({
      nodes: node.children ?? [],
      reportMatchedIds: reportMatchedIds
    });

    if (children.length > 0) {
      visibleNodes.push(
        spaceFolderToSpaceFolderX({
          spaceFolder: node,
          children: children,
          isMatched: true
        })
      );
    }
  });

  return visibleNodes;
}

export function markSelectedAncestors(item: {
  nodes: SpaceNodeX[];
  selectedReportId: string;
}): SpaceNodeX[] {
  let { nodes, selectedReportId } = item;

  return nodes.map(node => {
    if (node.type === 'spaceUnit') {
      return node;
    }

    let children = markSelectedAncestors({
      nodes: node.children ?? [],
      selectedReportId: selectedReportId
    });

    let isSelectedAncestor = children.some(child =>
      child.type === 'spaceUnit'
        ? child.unitId === selectedReportId
        : child.isSelectedAncestor === true
    );

    return spaceFolderToSpaceFolderX({
      spaceFolder: node,
      children: children,
      isMatched: node.isMatched,
      isSelectedAncestor: isSelectedAncestor
    });
  });
}

export function flattenFavoriteSpaceNodes(item: {
  nodes: SpaceNodeX[];
}): SpaceNodeX[] {
  let { nodes } = item;

  return nodes.reduce((acc: SpaceNodeX[], node) => {
    if (node.type === 'spaceUnit') {
      if (node.isFavorite === true) {
        acc.push(
          spaceUnitToSpaceUnitX({
            spaceUnit: node,
            isMatched: true
          })
        );
      }

      return acc;
    }

    let children = flattenFavoriteSpaceNodes({
      nodes: node.children ?? []
    });

    acc.push(...children);

    return acc;
  }, []);
}
