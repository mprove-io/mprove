import { DiffEditor } from '@acrodata/code-editor';
import { CommonModule } from '@angular/common';
import {
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
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState, Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { DialogRef } from '@ngneat/dialog';
import { parsePatch, type StructuredPatchHunk } from 'diff';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LIGHT_PLUS_THEME_EXTRA_DIFF_READ,
  VS_LIGHT_THEME_EXTRA_DIFF_READ
} from '#common/constants/code-themes/themes';
import { LIGHT_PLUS_LANGUAGES } from '#common/constants/top-front';
import { UiQuery } from '#front/app/queries/ui.query';
import {
  HighLightService,
  PlaceNameEnum
} from '#front/app/services/highlight.service';
import { SharedModule } from '../../shared/shared.module';
import type { FileDiffInfo } from '../session-chat.interfaces';

export interface FileDiffsDialogData {
  diff: FileDiffInfo;
}

@Component({
  selector: 'm-file-diffs-dialog',
  templateUrl: './file-diffs-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, DiffEditor, FormsModule]
})
export class FileDiffsDialogComponent implements OnInit, OnDestroy {
  @ViewChild('diffEditor', { static: false })
  diffEditorRef: DiffEditor;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;

  diffContent: { original: string; modified: string };
  isDiffRenderable = false;
  diffNotice?: string;
  rawPatch?: string;
  originalExtensions: Extension[];
  modifiedExtensions: Extension[];

  originalLanguages: LanguageDescription[] = [];
  modifiedLanguages: LanguageDescription[] = [];
  lang: string;
  isEditorOptionsInitComplete = false;

  isHighlighterReady: boolean;
  isHighlighterReady$ = this.uiQuery.select().pipe(
    tap(x => {
      this.isHighlighterReady = x.isHighlighterReady;

      if (
        this.isHighlighterReady === true &&
        this.isEditorOptionsInitComplete === false
      ) {
        this.initEditorOptions();
      }
    })
  );

  workerTaskCompletedSubscription: Subscription;

  private syncScrollCleanups: (() => void)[] = [];

  private baseExtensions: Extension[] = [
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...searchKeymap])
  ];

  constructor(
    public ref: DialogRef<FileDiffsDialogData>,
    private cd: ChangeDetectorRef,
    private highLightService: HighLightService,
    private uiQuery: UiQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);

    this.workerTaskCompletedSubscription = new Subscription();

    this.workerTaskCompletedSubscription.add(
      this.highLightService.workerTaskCompleted.subscribe(eventData => {
        if (eventData.placeName === PlaceNameEnum.DiffDialogOriginal) {
          this.forceReRender({ side: 'original' });
        } else if (eventData.placeName === PlaceNameEnum.DiffDialogModified) {
          this.forceReRender({ side: 'modified' });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.cleanupSyncScroll();
    this.workerTaskCompletedSubscription?.unsubscribe();
  }

  private initEditorOptions() {
    let originalLanguagesResult = this.highLightService.getLanguages({
      placeName: PlaceNameEnum.DiffDialogOriginal
    });

    let modifiedLanguagesResult = this.highLightService.getLanguages({
      placeName: PlaceNameEnum.DiffDialogModified
    });

    this.originalLanguages = originalLanguagesResult.languages;
    this.modifiedLanguages = modifiedLanguagesResult.languages;

    this.isEditorOptionsInitComplete = true;

    this.initDiffState();
  }

  private async initDiffState() {
    let diff = this.dataItem.diff;

    let parsedDiff: { original: string; modified: string; isPartial: boolean } =
      this.parseDiff({ patch: diff.patch });

    this.diffContent = {
      original: parsedDiff.original,
      modified: parsedDiff.modified
    };

    if (parsedDiff.isPartial) {
      this.diffNotice = 'Partial patch: only changed sections are shown.';
    }

    let readOnlyExt = EditorState.readOnly.of(true);

    let ext = this.getFileExtension(diff.file);

    let originalLangDesc = this.originalLanguages.find(
      (l: LanguageDescription) =>
        l.extensions.indexOf(ext) > -1 ||
        l.filename?.test(diff.file.split('/').pop() || '')
    );
    let modifiedLangDesc = this.modifiedLanguages.find(
      (l: LanguageDescription) =>
        l.extensions.indexOf(ext) > -1 ||
        l.filename?.test(diff.file.split('/').pop() || '')
    );
    this.lang = originalLangDesc?.name;

    let isMalloyLang =
      LIGHT_PLUS_LANGUAGES.indexOf(this.lang?.toLowerCase()) > -1;
    let themeExt =
      isMalloyLang === true
        ? LIGHT_PLUS_THEME_EXTRA_DIFF_READ
        : VS_LIGHT_THEME_EXTRA_DIFF_READ;

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

    if (originalLangDesc && modifiedLangDesc) {
      let originalLangSupport = await originalLangDesc.load();
      let modifiedLangSupport = await modifiedLangDesc.load();
      originalExtensions.push(originalLangSupport);
      modifiedExtensions.push(modifiedLangSupport);
    }

    this.originalExtensions = originalExtensions;
    this.modifiedExtensions = modifiedExtensions;

    this.cd.detectChanges();

    this.setupDiffEditorSyncScroll();

    if (isMalloyLang === true) {
      this.highLightService.updateDocText({
        placeName: PlaceNameEnum.DiffDialogOriginal,
        docText: this.diffContent.original,
        shikiLanguage: this.lang.toLowerCase(),
        shikiTheme: 'light-plus-extended',
        isThrottle: false
      });

      this.highLightService.updateDocText({
        placeName: PlaceNameEnum.DiffDialogModified,
        docText: this.diffContent.modified,
        shikiLanguage: this.lang.toLowerCase(),
        shikiTheme: 'light-plus-extended',
        isThrottle: false
      });
    }
  }

  private parseDiff(item: { patch?: string }): {
    original: string;
    modified: string;
    isPartial: boolean;
  } {
    let { patch } = item;

    if (patch === undefined) {
      this.diffNotice = 'Patch content is unavailable.';

      return { original: '', modified: '', isPartial: false };
    }

    if (patch.length === 0) {
      this.diffNotice = 'No textual diff is available.';

      return { original: '', modified: '', isPartial: false };
    }

    try {
      let parsedPatches: ReturnType<typeof parsePatch> = parsePatch(patch);

      if (parsedPatches.length !== 1 || parsedPatches[0].hunks.length === 0) {
        this.diffNotice = 'The patch could not be displayed.';
        this.rawPatch = patch;

        return { original: '', modified: '', isPartial: false };
      }

      let parsedPatch = parsedPatches[0];

      let firstHunk: StructuredPatchHunk = parsedPatch.hunks[0];

      let hasCompleteEnvelope: boolean =
        patch.startsWith('Index: ') || patch.startsWith('diff --git ');

      let isComplete: boolean =
        hasCompleteEnvelope &&
        parsedPatch.hunks.length === 1 &&
        firstHunk.oldStart <= 1 &&
        firstHunk.newStart <= 1;

      let content: { original: string; modified: string } =
        this.reconstructHunks({
          hunks: parsedPatch.hunks,
          includeHeaders: !isComplete
        });

      this.isDiffRenderable = true;

      return {
        original: content.original,
        modified: content.modified,
        isPartial: !isComplete
      };
    } catch {
      this.diffNotice = 'The patch could not be parsed.';
      this.rawPatch = patch;

      return { original: '', modified: '', isPartial: false };
    }
  }

  private reconstructHunks(item: {
    hunks: StructuredPatchHunk[];
    includeHeaders: boolean;
  }): { original: string; modified: string } {
    let { hunks, includeHeaders } = item;

    let originalLines: { text: string; newline: boolean }[] = [];

    let modifiedLines: { text: string; newline: boolean }[] = [];

    hunks.forEach((hunk, hunkIndex) => {
      if (includeHeaders) {
        let header: string = `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;

        if (hunkIndex > 0) {
          originalLines.push({ text: '', newline: true });
          modifiedLines.push({ text: '', newline: true });
        }

        originalLines.push({ text: header, newline: true });
        modifiedLines.push({ text: header, newline: true });
      }

      let previousPrefix: string | undefined;

      hunk.lines.forEach(line => {
        let prefix: string = line.slice(0, 1);

        if (prefix === '\\') {
          if (previousPrefix === '-' || previousPrefix === ' ') {
            let previousOriginal = originalLines.at(-1);

            if (previousOriginal) {
              previousOriginal.newline = false;
            }
          }

          if (previousPrefix === '+' || previousPrefix === ' ') {
            let previousModified = modifiedLines.at(-1);

            if (previousModified) {
              previousModified.newline = false;
            }
          }

          return;
        }

        let text: string = line.slice(1);

        if (prefix === '-' || prefix === ' ') {
          originalLines.push({ text: text, newline: true });
        }

        if (prefix === '+' || prefix === ' ') {
          modifiedLines.push({ text: text, newline: true });
        }

        previousPrefix = prefix;
      });
    });

    let original: string = originalLines
      .map(line => line.text + (line.newline ? '\n' : ''))
      .join('');

    let modified: string = modifiedLines
      .map(line => line.text + (line.newline ? '\n' : ''))
      .join('');

    return { original: original, modified: modified };
  }

  private forceReRender(item: { side: 'original' | 'modified' }) {
    let { side } = item;

    if (!this.diffEditorRef?.mergeView) {
      return;
    }

    let editorV =
      side === 'original'
        ? this.diffEditorRef.mergeView.a
        : this.diffEditorRef.mergeView.b;

    if (!editorV) {
      return;
    }

    let transaction = editorV.state.update({
      changes: {
        from: 0,
        to: editorV.state.doc.length,
        insert: editorV.state.doc.toString()
      },
      selection: editorV.state.selection,
      scrollIntoView: false
    });

    editorV.dispatch(transaction);
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
