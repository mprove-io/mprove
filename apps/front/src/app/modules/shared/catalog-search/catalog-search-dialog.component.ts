import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { SearchNode } from './search-node';

export type CatalogSearchDialogData = {
  label: string;
  inputTestId: string;
  word: string;
  preview: (word: string) => SearchNode[];
};

export type CatalogSearchDialogResult =
  | { kind: 'apply'; word: string }
  | { kind: 'open'; id: string };

type SearchRow = {
  node: SearchNode;
  level: number;
  parentId?: string;
};

@Component({
  standalone: false,
  selector: 'm-catalog-search-dialog',
  templateUrl: './catalog-search-dialog.component.html'
})
export class CatalogSearchDialogComponent {
  readonly minLength = 2;

  word = this.ref.data.word;

  rows: SearchRow[] = [];

  activeIndex = 0;

  readonly collapsedFolderIdSet = new Set<string>();

  private nodes: SearchNode[] = [];

  constructor(
    public ref: DialogRef<CatalogSearchDialogData, CatalogSearchDialogResult>
  ) {
    this.updatePreview({ word: this.word });
  }

  get canSearch(): boolean {
    let word: string = this.word.trim();

    return word.length >= this.minLength;
  }

  updatePreview(item: { word: string }): void {
    let { word } = item;

    this.word = word;
    this.activeIndex = 0;
    this.collapsedFolderIdSet.clear();
    this.nodes = this.canSearch ? this.ref.data.preview(word.trim()) : [];
    this.rows = this.makeRowsRecursive({ nodes: this.nodes, level: 1 });
  }

  apply(): void {
    if (this.canSearch) {
      this.ref.close({ kind: 'apply', word: this.word.trim() });
    }
  }

  activateRow(item: { row: SearchRow }): void {
    let { row } = item;

    if (row.node.kind === 'folder') {
      this.toggleFolder({ id: row.node.id });
    } else {
      this.ref.close({ kind: 'open', id: row.node.id });
    }
  }

  moveFocus(item: {
    event: KeyboardEvent;
    input: HTMLInputElement;
    resultTree: HTMLDivElement;
  }): void {
    let { event, input, resultTree } = item;

    if (
      event.isComposing ||
      [
        'ArrowDown',
        'ArrowUp',
        'ArrowRight',
        'ArrowLeft',
        'Home',
        'End'
      ].indexOf(event.key) < 0
    ) {
      return;
    }

    let buttons: HTMLButtonElement[] = Array.from(
      resultTree.querySelectorAll<HTMLButtonElement>('[role="treeitem"]')
    );

    if (
      event.target === input &&
      event.key === 'ArrowDown' &&
      buttons.length > 0
    ) {
      event.preventDefault();

      buttons[0].focus();

      return;
    }

    let index: number = buttons.findIndex(button => button === event.target);

    if (index < 0) {
      return;
    }

    event.preventDefault();

    let row: SearchRow = this.rows[index];

    if (event.key === 'ArrowDown') {
      buttons[index + 1]?.focus();
    } else if (event.key === 'ArrowUp') {
      (buttons[index - 1] ?? input).focus();
    } else if (event.key === 'Home') {
      buttons[0]?.focus();
    } else if (event.key === 'End') {
      buttons[buttons.length - 1]?.focus();
    } else if (event.key === 'ArrowRight' && row.node.kind === 'folder') {
      if (this.collapsedFolderIdSet.has(row.node.id)) {
        this.toggleFolder({ id: row.node.id });
      } else {
        buttons[index + 1]?.focus();
      }
    } else if (event.key === 'ArrowLeft') {
      if (
        row.node.kind === 'folder' &&
        this.collapsedFolderIdSet.has(row.node.id) === false
      ) {
        this.toggleFolder({ id: row.node.id });
      } else if (isDefined(row.parentId)) {
        let parentIndex: number = this.rows.findIndex(
          candidate =>
            candidate.node.kind === 'folder' &&
            candidate.node.id === row.parentId
        );

        buttons[parentIndex]?.focus();
      }
    }
  }

  private makeRowsRecursive(item: {
    nodes: SearchNode[];
    level: number;
    parentId?: string;
  }): SearchRow[] {
    let { nodes, level, parentId } = item;

    let rows: SearchRow[] = [];

    nodes.forEach(node => {
      rows.push({ node: node, level: level, parentId: parentId });

      if (
        node.kind === 'folder' &&
        this.collapsedFolderIdSet.has(node.id) === false
      ) {
        rows.push(
          ...this.makeRowsRecursive({
            nodes: node.children,
            level: level + 1,
            parentId: node.id
          })
        );
      }
    });

    return rows;
  }

  private toggleFolder(item: { id: string }): void {
    let { id } = item;

    if (this.collapsedFolderIdSet.has(id)) {
      this.collapsedFolderIdSet.delete(id);
    } else {
      this.collapsedFolderIdSet.add(id);
    }

    this.rows = this.makeRowsRecursive({ nodes: this.nodes, level: 1 });
  }
}
