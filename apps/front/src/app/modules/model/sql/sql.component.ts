import { ChangeDetectorRef, Component } from '@angular/core';
import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
import { tap } from 'rxjs/operators';
import { MqQuery } from '~front/app/queries/mq.query';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-sql',
  templateUrl: './sql.component.html'
})
export class SqlComponent {
  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    readOnly: true,
    language: 'sql',
    theme: constants.DEFAULT_THEME_NAME,
    fontSize: 16
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

  constructor(
    private cd: ChangeDetectorRef,
    private mqQuery: MqQuery,
    private monacoEditorLoaderService: MonacoEditorLoaderService
  ) {}

  async onEditorInit(editor: any) {
    this.editor = editor;
  }
}
