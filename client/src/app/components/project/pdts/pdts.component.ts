import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-pdts',
  templateUrl: 'pdts.component.html',
  styleUrls: ['pdts.component.scss']
})
export class PdtsComponent {
  columnsToDisplay: string[] = [
    'pdt_id',
    'show_sql',
    'pdt_trigger_time',
    'show_pdt_trigger_sql',
    'pdt_trigger_sql_value',
    'status',
    'menu'
  ];

  queryStatusEnum = api.QueryStatusEnum;

  pdtsExtra: interfaces.QueryExtra[];
  pdtsExtra$ = this.store
    .select(selectors.getSelectedProjectModeRepoStructPdtsExtraOrdered)
    .pipe(
      filter(v => !!v),
      tap(pdtsExtra => {
        this.pdtsExtra = pdtsExtra;
      })
    );

  selectedProjectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here
  prodStructId$ = this.store.select(
    selectors.getSelectedProjectProdRepoStructId
  ); // no filter here

  getSelectedProjectUserIsAdminOrEditor$ = this.store.select(
    selectors.getSelectedProjectUserIsAdminOrEditor
  );

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private myDialogService: services.MyDialogService,
    public pageTitle: services.PageTitleService
  ) {
    this.pageTitle.setProjectSubtitle('Pdts');
  }

  canDeactivate(): boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from DashboardComponent:',
      event
    );
    return true;
  }

  showSql(row: interfaces.QueryExtraTime) {
    let sqlText = '';

    row.sql.forEach(sqlLine => (sqlText = sqlText.concat(...[sqlLine, '\n'])));

    this.myDialogService.showSqlDialog({
      name: row.pdt_id,
      sql: sqlText
    });
  }

  showPdtTriggerSql(row: interfaces.QueryExtraTime) {
    this.myDialogService.showSqlDialog({
      name: `pdt_trigger_sql for ${row.pdt_id}:`,
      sql: row.pdt_trigger_sql
    });
  }

  run(queryId: string) {
    this.store.dispatch(
      new actions.RunQueriesAction({
        query_ids: [queryId],
        refresh: false
      })
    );
  }

  runRefresh(queryId: string) {
    this.store.dispatch(
      new actions.RunQueriesAction({
        query_ids: [queryId],
        refresh: true
      })
    );
  }
}
