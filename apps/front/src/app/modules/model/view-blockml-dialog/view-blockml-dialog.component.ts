import { Component, OnInit } from '@angular/core';
// import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
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
  // editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    readOnly: true,
    language: constants.BLOCKML_LANGUAGE_ID,
    theme: constants.BLOCKML_THEME_NAME,
    fontSize: 16
  };

  reportYaml: string;

  constructor(
    public ref: DialogRef<ViewBlockmlDialogDataItem>,
    private structQuery: StructQuery
  ) // ,
  // private monacoEditorLoaderService: MonacoEditorLoaderService
  {
    // this.monacoEditorLoaderService.isMonacoLoaded$
    //   .pipe(
    //     filter(isLoaded => isLoaded),
    //     take(1)
    //   )
    //   .subscribe(() => {
    //     monaco.languages.register({ id: constants.BLOCKML_LANGUAGE_NAME });
    //     monaco.languages.setMonarchTokensProvider(
    //       constants.BLOCKML_LANGUAGE_NAME,
    //       constants.BLOCKML_YAML_LANGUAGE
    //     );
    //     monaco.editor.defineTheme(
    //       this.editorOptions.theme,
    //       constants.BLOCKML_TEXTMATE_THEME as any
    //     );
    //     monaco.editor.setTheme(constants.BLOCKML_TEXTMATE_THEME_NAME);
    //   });
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
    // this.editor = editor;
  }
}
