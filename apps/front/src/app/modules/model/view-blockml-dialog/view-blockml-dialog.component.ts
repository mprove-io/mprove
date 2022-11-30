import { Component, HostListener, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { MonacoEditorOptions, MonacoProviderService } from 'ng-monaco-editor';
import { take, tap } from 'rxjs/operators';
import { StructQuery } from '~front/app/queries/struct.query';
import { StructState } from '~front/app/stores/struct.store';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface ViewBlockmlDialogData {
  mconfig: common.MconfigX;
}

@Component({
  selector: 'm-view-blockml-dialog',
  templateUrl: './view-blockml-dialog.component.html',
  styleUrls: ['./view-blockml-dialog.component.scss']
})
export class ViewBlockmlDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.BLOCKML_THEME,
    language: constants.YAML_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true
  };

  reportYaml: string;

  constructor(
    public ref: DialogRef<ViewBlockmlDialogData>,
    private structQuery: StructQuery,
    private monacoService: MonacoProviderService
  ) {}

  async ngOnInit() {
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

    let monaco = await this.monacoService.initMonaco();
    monaco.languages.setMonarchTokensProvider(
      constants.YAML_LANGUAGE_ID,
      constants.BLOCKML_LANGUAGE_DATA
    );

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }
}
