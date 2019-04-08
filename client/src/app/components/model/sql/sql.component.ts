import { Component, ViewChild, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as services from '@app/services/_index';
import * as selectors from '@app/store-selectors/_index';
import * as configs from '@app/configs/_index';
import { ITdDataTableColumn } from '@covalent/core';

@Component({
  moduleId: module.id,
  selector: 'm-sql',
  templateUrl: 'sql.component.html',
  styleUrls: ['sql.component.scss']
})
export class SqlComponent {
  queryStatusEnum = api.QueryStatusEnum;

  sqlEditorTheme: string = 'sqlserver';

  query: interfaces.SqlPart;

  partsWithQuery;

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
        part: 'Query',
        sql: sqlText,
        status: query.status,
        last_error_message: query.last_error_message
      };

      this.partsWithQuery = [...this.parts, this.query];
    })
  );

  parts: interfaces.SqlPart[] = [];
  parts$ = this.store.select(selectors.getSelectedQueryPdtsAllOrdered).pipe(
    filter(v => !!v),
    tap(queriesPdt => {
      let parts: interfaces.SqlPart[] = [];

      queriesPdt.forEach(x => {
        let sqlText: string = '';

        x.sql.forEach(
          sqlLine => (sqlText = sqlText.concat(...[sqlLine, '\n']))
        );

        parts.push({
          part: `PDT ${x.pdt_id}`,
          sql: sqlText,
          status: x.status,
          last_error_message: x.last_error_message
        });
      });

      this.parts = parts;

      this.partsWithQuery = [...this.parts, this.query];
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

  columns: ITdDataTableColumn[] = [
    { name: 'part', label: 'part', width: 150 },
    { name: 'show_sql', label: 'SQL', width: 150 },
    { name: 'status', label: 'Status', width: 150 }
  ];

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService
  ) {}

  showSql(row: { part: string; sql: string }) {
    this.myDialogService.showSqlDialog({
      name: row.part,
      sql: row.sql
    });
  }
}
