import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/sql';
import 'brace/theme/solarized_dark';
import 'brace/theme/sqlserver';
import { AceEditorComponent } from 'ng2-ace-editor';
import { filter, tap } from 'rxjs/operators';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-sql',
  templateUrl: 'sql.component.html',
  styleUrls: ['sql.component.scss']
})
export class SqlComponent {
  sqlEditorTheme: string = 'sqlserver';

  @ViewChild('editor') editor: AceEditorComponent;

  query: interfaces.SqlPart;

  query$ = this.store.select(selectors.getSelectedQuery).pipe(
    filter(v => !!v),
    tap(query => {
      let sqlText: string = '';

      if (query && query.sql && query.sql.length > 0) {
        query.sql.forEach(
          sqlLine => (sqlText = sqlText.concat(...[sqlLine, '\n']))
        );
      }

      this.query = {
        name: 'Query',
        sql: sqlText
      };
    })
  );

  parts: interfaces.PdtPart[] = [];
  parts$ = this.store.select(selectors.getSelectedQueryPdtsAllOrdered).pipe(
    filter(v => !!v),
    tap(queriesPdt => {
      let parts: interfaces.PdtPart[] = [];

      queriesPdt.forEach(x => {
        let sqlText: string = '';

        x.sql.forEach(
          sqlLine => (sqlText = sqlText.concat(...[sqlLine, '\n']))
        );

        parts.push({
          name: `PDT ${x.pdt_id}`,
          sql: sqlText
        });
      });

      this.parts = parts;
    })
  );

  mconfigSelectFields: api.ModelField[] = [];
  mconfigSelectFields$ = this.store
    .select(selectors.getSelectedMconfigSelectFields)
    .pipe(
      // no filter here
      tap(x => {
        this.mconfigSelectFields = x;
      })
    );

  constructor(private store: Store<interfaces.AppState>) {}
}
