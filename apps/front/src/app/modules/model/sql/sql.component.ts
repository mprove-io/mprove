import { ChangeDetectorRef, Component } from '@angular/core';
import * as monaco from 'monaco-editor';
import { tap } from 'rxjs/operators';
import { MqQuery } from '~front/app/queries/mq.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-sql',
  templateUrl: './sql.component.html'
})
export class SqlComponent {
  editorTheme = 'vs';
  editorLanguage = 'sql';

  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    readOnly: true,
    theme: this.editorTheme,
    fontSize: 16,
    language: this.editorLanguage
  };

  content: string;

  query: common.Query;
  query$ = this.mqQuery.query$.pipe(
    tap(x => {
      this.query = x;
      this.content = x.sql;
      this.cd.detectChanges();
    })
  );

  constructor(private cd: ChangeDetectorRef, private mqQuery: MqQuery) {}

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    // monaco.editor.setTheme(this.editorTheme);
    // monaco.editor.setModelLanguage(editor.getModel(), this.editorLanguage);
  }
}
