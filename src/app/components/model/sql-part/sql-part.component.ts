import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap, delay } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-sql-part',
  templateUrl: 'sql-part.component.html',
  styleUrls: ['sql-part.component.scss']
})
export class SqlPartComponent {
  @Input() text: string;

  sqlEditorTheme: string = null;

  editorOptions = {
    theme: this.sqlEditorTheme,
    readOnly: true,
    fontSize: 16,
    language: 'sql'
  };

  codeEditor: monaco.editor.IEditor = null;

  sqlEditorTheme$ = this.store.select(selectors.getUserSqlTheme).pipe(
    filter(v => !!v),
    delay(0),
    tap(x => {
      this.sqlEditorTheme = x === api.UserSqlThemeEnum.Light ? 'vs' : 'vs-dark';

      if (this.codeEditor) {
        monaco.editor.setTheme(this.sqlEditorTheme);
      }
    })
  );

  constructor(private store: Store<interfaces.AppState>) {}

  async onEditorInit(editor: monaco.editor.IEditor) {
    this.codeEditor = editor;
    monaco.editor.setTheme(this.sqlEditorTheme);
  }
}
