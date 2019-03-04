import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as api from '@app/api/_index';
import { filter, delay, tap } from 'rxjs/operators';

@Component({
  moduleId: module.id,
  selector: 'm-sql-dialog',
  templateUrl: 'sql-dialog.component.html',
  styleUrls: ['sql-dialog.component.scss']
})
export class SqlDialogComponent {
  automaticLayout: boolean = true;

  sqlEditorTheme: string = null;

  editorOptions = {
    theme: this.sqlEditorTheme,
    readOnly: true,
    fontSize: 16,
    language: 'sql'
  };

  editor: monaco.editor.IStandaloneCodeEditor = null;

  sqlEditorTheme$ = this.store.select(selectors.getUserSqlTheme).pipe(
    filter(v => !!v),
    delay(0),
    tap(x => {
      this.sqlEditorTheme = x === api.UserSqlThemeEnum.Light ? 'vs' : 'vs-dark';

      if (this.editor) {
        monaco.editor.setTheme(this.sqlEditorTheme);
      }
    })
  );

  constructor(
    private store: Store<interfaces.AppState>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SqlDialogComponent>
  ) {}

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    monaco.editor.setTheme(this.sqlEditorTheme);
  }
}
