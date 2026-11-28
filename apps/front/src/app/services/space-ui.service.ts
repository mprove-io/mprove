import { Injectable } from '@angular/core';
import { makeSpaceUnits } from '#common/functions/make-space-units/make-space-units';
import type { SpaceFolder } from '#common/types/backend/parts/space-folder';
import type { SpaceFolderX } from '#common/types/backend/parts/space-folder-x';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { SpaceNodeX } from '#common/types/backend/parts/space-node-x';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';
import {
  type CatalogItemMatch,
  matchCatalogItems
} from '#front/app/modules/shared/catalog-search/match-catalog-items';
import {
  CATALOG_SEARCH_PREVIEW_LIMIT,
  type SearchNode
} from '#front/app/modules/shared/catalog-search/search-node';
import { UnitsUiService } from './units-ui.service';

@Injectable({ providedIn: 'root' })
export class SpaceUiService {
  constructor(private unitsUiService: UnitsUiService) {}

  matchUnits(item: { nodes: SpaceNode[]; word: string }): SpaceUnit[] {
    let { nodes, word } = item;

    let units: SpaceUnit[] = this.matchUnitResults({
      nodes: nodes,
      word: word
    }).map(match => match.item);

    return units;
  }

  private matchUnitResults(item: {
    nodes: SpaceNode[];
    word: string;
  }): CatalogItemMatch<SpaceUnit>[] {
    let { nodes, word } = item;

    let units: SpaceUnit[] = makeSpaceUnits({ spaceNodes: nodes ?? [] });

    let matches: CatalogItemMatch<SpaceUnit>[] = matchCatalogItems({
      items: units,
      getSearchText: unit => {
        let title = unit.title ?? unit.unitId;
        let modelLabel = unit.modelLabel ?? '';

        let roles: string = unit.accessRolesCombined.map(x => x.role).join(' ');

        return `${title} ${unit.unitId} ${unit.author ?? ''} ${unit.spaceFullTitle}${modelLabel ? ` ${modelLabel}` : ''} ${roles}`;
      },
      getFields: unit => unit.selectedFields,
      word: word
    });

    return matches;
  }

  makeSearchPreview(item: { nodes: SpaceNode[]; word: string }): SearchNode[] {
    let { nodes, word } = item;

    let matches: CatalogItemMatch<SpaceUnit>[] = this.matchUnitResults({
      nodes: nodes,
      word: word
    }).slice(0, CATALOG_SEARCH_PREVIEW_LIMIT);

    let matchById = new Map(matches.map(match => [match.item.unitId, match]));

    let visibleNodes: SpaceNodeX[] = this.makeVisibleSpaceNodes({
      nodes: nodes,
      unitMatchedIds: new Set(matchById.keys())
    });

    let preview: SearchNode[] = this.toSearchNodesRecursive({
      nodes: visibleNodes,
      matchById: matchById
    });

    return preview;
  }

  private toSearchNodesRecursive(item: {
    nodes: SpaceNodeX[];
    matchById: Map<string, CatalogItemMatch<SpaceUnit>>;
  }): SearchNode[] {
    let { nodes, matchById } = item;

    let searchNodes: SearchNode[] = nodes.map(node =>
      node.type === 'spaceFolder'
        ? {
            kind: 'folder',
            id: node.id,
            label: node.title,
            children: this.toSearchNodesRecursive({
              nodes: node.children,
              matchById: matchById
            })
          }
        : {
            kind: 'result',
            id: node.unitId,
            label: node.title || node.unitId,
            matchedFieldLabels: matchById.get(node.unitId)?.matchedFieldLabels
          }
    );

    return searchNodes;
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
