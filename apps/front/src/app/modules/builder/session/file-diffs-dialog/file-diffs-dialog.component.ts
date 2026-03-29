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
export class FileDiffsDialogComponent implements OnInit, OnDestroy {
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

    this.diffContent = {
      original: diff.before ?? '',
      modified: diff.after ?? ''
    };

    this.cd.detectChanges();

    this.setupDiffEditorSyncScroll();

    if (isMalloyLang === true) {
      this.highLightService.updateDocText({
        placeName: PlaceNameEnum.DiffDialogOriginal,
        docText: diff.before ?? '',
        shikiLanguage: this.lang.toLowerCase(),
        shikiTheme: 'light-plus-extended',
        isThrottle: false
      });

      this.highLightService.updateDocText({
        placeName: PlaceNameEnum.DiffDialogModified,
        docText: diff.after ?? '',
        shikiLanguage: this.lang.toLowerCase(),
        shikiTheme: 'light-plus-extended',
        isThrottle: false
      });
    }
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
