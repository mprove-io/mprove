import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { TimeService } from '~front/app/services/time.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-query-status',
  templateUrl: './query-status.component.html'
})
export class QueryStatusComponent implements OnChanges {
  queryStatusEnum = common.QueryStatusEnum;

  spinnerName = common.makeId();

  @Input()
  query: common.Query;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  completedTimeAgo: string;
  canceledTimeAgo: string;
  errorTimeAgo: string;
  runSecondsAgo: number;

  interval$ = interval(1000).pipe(
    startWith(0),
    tap(x => {
      this.calculateTimes();
      this.cd.detectChanges();
    })
  );

  constructor(
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private timeService: TimeService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (common.isDefined(changes.query)) {
      this.query = changes.query.currentValue;

      this.calculateTimes();

      if (this.query.status === common.QueryStatusEnum.Running) {
        this.spinner.show(this.spinnerName);
      } else {
        this.spinner.hide(this.spinnerName);
      }

      this.cd.detectChanges();
    }
  }

  calculateTimes() {
    if (common.isUndefined(this.nav?.serverTimeDiff)) {
      return;
    }

    this.completedTimeAgo = common.isDefined(this.query.lastCompleteTs)
      ? this.timeService.timeAgoFromNow(
          this.query.lastCompleteTs + this.nav.serverTimeDiff
        )
      : '';

    this.canceledTimeAgo = common.isDefined(this.query.lastCancelTs)
      ? this.timeService.timeAgoFromNow(
          this.query.lastCancelTs + this.nav.serverTimeDiff
        )
      : '';

    this.errorTimeAgo = common.isDefined(this.query.lastErrorTs)
      ? this.timeService.timeAgoFromNow(
          this.query.lastErrorTs + this.nav.serverTimeDiff
        )
      : '';

    let s = common.isDefined(this.query.lastRunTs)
      ? this.timeService.secondsAgoFromNow(
          this.query.lastRunTs + this.nav.serverTimeDiff
        )
      : 0;

    this.runSecondsAgo = s > 0 ? s : 0;
  }
}
