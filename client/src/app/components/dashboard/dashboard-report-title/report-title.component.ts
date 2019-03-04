import { Component, Inject, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval } from 'rxjs';
import { debounceTime, filter, map, startWith, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-report-title',
  templateUrl: 'report-title.component.html',
  styleUrls: ['report-title.component.scss']
})
export class ReportTitleComponent {
  @Input() visual: interfaces.Visual;

  queryStatusEnum = api.QueryStatusEnum;

  dashThemeEnum = api.UserDashThemeEnum;

  dashTheme: api.UserDashThemeEnum = null;
  dashTheme$ = this.store.select(selectors.getUserDashTheme).pipe(
    filter(v => !!v),
    debounceTime(1),
    tap(x => (this.dashTheme = x))
  );

  runSecondsAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.secondsAgoFromNow(this.visual.query.last_run_ts))
  );

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private navigateService: services.NavigateService,
    private timeService: services.TimeService,
    private store: Store<interfaces.AppState>,
    private structService: services.StructService
  ) {}

  reportClick(visual: interfaces.Visual) {
    if (visual.has_access_to_model && !visual.is_model_hidden) {
      let mconfigId = visual.mconfig.mconfig_id;
      let queryId = visual.mconfig.query_id;

      this.store.dispatch(
        new actions.DuplicateMconfigAndQueryAction({
          mconfig_id: mconfigId,
          query_id: queryId
        })
      );
    }
  }
}
