import { Component, OnInit } from '@angular/core';
import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
import { DialogRef } from '@ngneat/dialog';
import { filter, take, tap } from 'rxjs/operators';
import { StructQuery } from '~front/app/queries/struct.query';
import { StructState } from '~front/app/stores/struct.store';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface ViewBlockmlDialogDataItem {
  mconfig: common.MconfigX;
}

@Component({
  selector: 'm-view-blockml-dialog',
  templateUrl: './view-blockml-dialog.component.html'
})
export class ViewBlockmlDialogComponent implements OnInit {
  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    readOnly: true,
    theme: 'textmate',
    fontSize: 16,
    language: 'yaml'
  };

  reportYaml: string;

  constructor(
    public ref: DialogRef<ViewBlockmlDialogDataItem>,
    private structQuery: StructQuery,
    private monacoEditorLoaderService: MonacoEditorLoaderService
  ) {
    this.monacoEditorLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1)
      )
      .subscribe(() => {
        monaco.editor.defineTheme(
          this.editorOptions.theme,
          constants.TEXTMATE_BLOCKML_THEME as any
        );
        monaco.editor.setTheme(this.editorOptions.theme);
      });
  }

  ngOnInit() {
    let struct: StructState;
    this.structQuery
      .select()
      .pipe(
        tap(x => (struct = x)),
        take(1)
      )
      .subscribe();

    let rep = common.prepareReport({
      isForDashboard: false,
      mconfig: this.ref.data.mconfig,
      defaultTimezone: struct.defaultTimezone
    });

    this.reportYaml = common.toYaml({ reports: [rep] });
  }

  async onEditorInit(editor: any) {
    this.editor = editor;
  }
}
