import { DiffEditor } from '@acrodata/code-editor';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { defaultKeymap } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState, Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { DialogRef } from '@ngneat/dialog';
import { VS_LIGHT_THEME_EXTRA_DIFF_READ } from '#common/constants/code-themes/themes';
import { SharedModule } from '../../../shared/shared.module';

export interface FileDiffDialogItem {
  file: string;
  additions: number;
  deletions: number;
  status?: 'added' | 'deleted' | 'modified';
  before?: string;
  after?: string;
}

export interface FileDiffsDialogData {
  diff: FileDiffDialogItem;
}

@Component({
  selector: 'm-file-diffs-dialog',
  templateUrl: './file-diffs-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, DiffEditor, FormsModule]
})
export class FileDiffsDialogComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('diffEditor', { static: false })
  diffEditorRef: DiffEditor;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;

  diffContent: { original: string; modified: string };
  originalExtensions: Extension[];
  modifiedExtensions: Extension[];

  private syncScrollCleanups: (() => void)[] = [];

  private baseExtensions: Extension[] = [
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...searchKeymap])
  ];

  constructor(
    public ref: DialogRef<FileDiffsDialogData>,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);

    this.initDiffState();
  }

  ngAfterViewInit(): void {
    this.setupDiffEditorSyncScroll();
  }

  ngOnDestroy(): void {
    this.cleanupSyncScroll();
  }

  private initDiffState() {
    let diff = this.dataItem.diff;

    let readOnlyExt = EditorState.readOnly.of(true);
    let themeExt = VS_LIGHT_THEME_EXTRA_DIFF_READ;

    let originalExtensions: Extension[] = [
      ...this.baseExtensions,
      readOnlyExt,
      themeExt
    ];
    let modifiedExtensions: Extension[] = [
      ...this.baseExtensions,
      readOnlyExt,
      themeExt
    ];

    let ext = this.getFileExtension(diff.file);
    let langDesc = languageData.languages.find(
      (l: LanguageDescription) =>
        l.extensions.indexOf(ext) > -1 ||
        l.filename?.test(diff.file.split('/').pop() || '')
    );

    if (langDesc) {
      langDesc.load().then(langSupport => {
        this.originalExtensions = [...originalExtensions, langSupport];
        this.modifiedExtensions = [...modifiedExtensions, langSupport];
        this.cd.detectChanges();
      });
    }

    this.diffContent = {
      original: diff.before ?? '',
      modified: diff.after ?? ''
    };
    this.originalExtensions = originalExtensions;
    this.modifiedExtensions = modifiedExtensions;
  }

  private setupDiffEditorSyncScroll() {
    setTimeout(() => {
      if (
        this.diffEditorRef?.mergeView?.a &&
        this.diffEditorRef?.mergeView?.b
      ) {
        let editorA = this.diffEditorRef.mergeView.a;
        let editorB = this.diffEditorRef.mergeView.b;

        this.cleanupSyncScroll();

        let isSyncing = false;

        let syncScrollHandler = (
          source: { scrollDOM: HTMLElement },
          target: { scrollDOM: HTMLElement }
        ) => {
          return () => {
            if (isSyncing === true) {
              return;
            }
            isSyncing = true;
            target.scrollDOM.scrollTop = source.scrollDOM.scrollTop;
            requestAnimationFrame(() => (isSyncing = false));
          };
        };

        let aToB = syncScrollHandler(editorA, editorB);
        let bToA = syncScrollHandler(editorB, editorA);

        editorA.scrollDOM.addEventListener('scroll', aToB);
        editorB.scrollDOM.addEventListener('scroll', bToA);

        this.syncScrollCleanups.push(
          () => editorA.scrollDOM.removeEventListener('scroll', aToB),
          () => editorB.scrollDOM.removeEventListener('scroll', bToA)
        );

        editorB.scrollDOM.scrollTop = editorA.scrollDOM.scrollTop;
      }
    });
  }

  private cleanupSyncScroll() {
    this.syncScrollCleanups.forEach(cleanup => cleanup());
    this.syncScrollCleanups = [];
  }

  private getFileExtension(filePath: string): string {
    let parts = filePath.split('.');
    return parts.length > 1 ? (parts.pop() as string) : '';
  }
}
