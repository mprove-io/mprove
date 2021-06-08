import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { QueryQuery } from '~front/app/queries/query.query';
import { QueryState } from '~front/app/stores/query.store';

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

  query: QueryState;
  query$ = this.queryQuery.select().pipe(
    tap(x => {
      this.query = x;
      this.content = x.sql;
      console.log(this.content);
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
