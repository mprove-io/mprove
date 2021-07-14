import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { QueryQuery } from '~front/app/queries/query.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-sql',
  templateUrl: './sql.component.html'
})
export class SqlComponent {
  fileEditorTheme = 'vs';
  sqlEditorLanguage = 'sql';

  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    readOnly: true,
    theme: this.fileEditorTheme,
    fontSize: 16,
    language: this.sqlEditorLanguage
  };

  content: string;

  query: common.Query;
  query$ = this.queryQuery.query$.pipe(
    tap(x => {
      this.query = x;
      this.content = x.sql;
      this.cd.detectChanges();
    })
  );

  constructor(private cd: ChangeDetectorRef, private queryQuery: QueryQuery) {}

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    // monaco.editor.setTheme(this.fileEditorTheme);
    // monaco.editor.setModelLanguage(editor.getModel(), this.sqlEditorLanguage);
  }
}
