import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { MonacoEditorOptions } from 'ng-monaco-editor';
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
  templateUrl: './view-blockml-dialog.component.html',
  styleUrls: ['./view-blockml-dialog.component.scss']
})
export class ViewBlockmlDialogComponent implements OnInit {
  editorOptions: MonacoEditorOptions = {
    language: constants.BLOCKML_LANGUAGE_ID,
    theme: constants.BLOCKML_THEME_NAME,
    readOnly: true,
    fontSize: 16,
    renderValidationDecorations: 'off',
    snippetSuggestions: 'none',
    suggestOnTriggerCharacters: false,
    quickSuggestions: false,
    wordBasedSuggestionsOnlySameLanguage: true,
    wordBasedSuggestions: false
  };

  reportYaml: string;

  constructor(
    public ref: DialogRef<ViewBlockmlDialogDataItem>,
    private structQuery: StructQuery
  ) {}

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
}
