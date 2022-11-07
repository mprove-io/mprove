import { ChangeDetectorRef, Component } from '@angular/core';
import { MonacoEditorOptions } from 'ng-monaco-editor';
import { tap } from 'rxjs/operators';
import { MqQuery } from '~front/app/queries/mq.query';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-sql',
  templateUrl: './sql.component.html'
})
export class SqlComponent {
  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.TEXTMATE_THEME,
    language: constants.SQL_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true,
    snippetSuggestions: 'none',
    suggestOnTriggerCharacters: false,
    quickSuggestions: false,
    wordBasedSuggestionsOnlySameLanguage: true,
    wordBasedSuggestions: false
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
}
