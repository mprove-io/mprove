import { Injectable } from '@angular/core';
import type { SpaceFolder } from '#common/zod/backend/space-folder';
import type { SpaceFolderX } from '#common/zod/backend/space-folder-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceNodeX } from '#common/zod/backend/space-node-x';
import { UnitsUiService } from './units-ui.service';

@Injectable({ providedIn: 'root' })
export class SpaceUiService {
  constructor(private unitsUiService: UnitsUiService) {}

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
    unitMatchedIds?: Set<string>;
  }): SpaceNodeX[] {
    let { nodes, unitMatchedIds } = item;
    let visibleNodes: SpaceNodeX[] = [];

    (nodes ?? []).forEach(node => {
      if (node.type === 'spaceUnit') {
        let isUnitMatched =
          unitMatchedIds === undefined ? true : unitMatchedIds.has(node.unitId);

        if (isUnitMatched === true) {
          visibleNodes.push(
            this.unitsUiService.spaceUnitToSpaceUnitX({
              spaceUnit: node,
              isMatched: true
            })
          );
        }

        return;
      }

      let children = this.makeVisibleSpaceNodes({
        nodes: node.children ?? [],
        unitMatchedIds: unitMatchedIds
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
    selectedUnitId: string;
  }): SpaceNodeX[] {
    let { nodes, selectedUnitId } = item;

    return nodes.map(node => {
      if (node.type === 'spaceUnit') {
        return node;
      }

      let children = this.markSelectedAncestors({
        nodes: node.children ?? [],
        selectedUnitId: selectedUnitId
      });

      let isSelectedAncestor = children.some(child =>
        child.type === 'spaceUnit'
          ? child.unitId === selectedUnitId
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
            this.unitsUiService.spaceUnitToSpaceUnitX({
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
