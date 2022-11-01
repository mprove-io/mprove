import { ChangeDetectorRef, Component } from '@angular/core';
import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
import { filter, take, tap } from 'rxjs/operators';
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
    theme: 'textmate',
    fontSize: 16,
    language: 'sql'
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
    private monacoLoaderService: MonacoEditorLoaderService
  ) {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1)
      )
      .subscribe(() => {
        monaco.editor.defineTheme(
          this.editorOptions.theme,
          constants.MY_TEXTMATE_THEME as any
        );
        monaco.editor.setTheme(this.editorOptions.theme);
      });
  }

  async onEditorInit(editor: any) {
    this.editor = editor;
  }
}
