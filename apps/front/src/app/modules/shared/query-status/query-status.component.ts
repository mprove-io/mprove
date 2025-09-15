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
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Query } from '~common/interfaces/blockml/query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { TimeService } from '~front/app/services/time.service';

@Component({
  standalone: false,
  selector: 'm-query-status',
  templateUrl: './query-status.component.html'
})
export class QueryStatusComponent implements OnChanges {
  queryStatusEnum = QueryStatusEnum;

  spinnerName = makeId();

  @Input()
  query: Query;

  @Input()
  showDataRowsLength: boolean;

  @Input()
  showLastCompleteDuration: boolean;

  @Input()
  completedWord: string;

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
    if (isDefined(changes.query)) {
      this.query = changes.query.currentValue;

      this.calculateTimes();

      if (this.query.status === QueryStatusEnum.Running) {
        this.spinner.show(this.spinnerName);
      } else {
        this.spinner.hide(this.spinnerName);
      }

      this.cd.detectChanges();
    }
  }

  calculateTimes() {
    if (isUndefined(this.nav?.serverTimeDiff)) {
      return;
    }

    this.completedTimeAgo = isDefined(this.query.lastCompleteTs)
      ? this.timeService.timeAgoFromNow(
          this.query.lastCompleteTs + this.nav.serverTimeDiff
        )
      : '';

    this.canceledTimeAgo = isDefined(this.query.lastCancelTs)
      ? this.timeService.timeAgoFromNow(
          this.query.lastCancelTs + this.nav.serverTimeDiff
        )
      : '';

    this.errorTimeAgo = isDefined(this.query.lastErrorTs)
      ? this.timeService.timeAgoFromNow(
          this.query.lastErrorTs + this.nav.serverTimeDiff
        )
      : '';

    let s = isDefined(this.query.lastRunTs)
      ? this.timeService.secondsAgoFromNow(
          this.query.lastRunTs + this.nav.serverTimeDiff
        )
      : 0;

    this.runSecondsAgo = s > 0 ? s : 0;
  }
}
