import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { take, tap } from 'rxjs';
import { emptyRep, RepQuery } from '~front/app/queries/rep.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { TimeQuery } from '~front/app/queries/time.query';
import { StructRepResolver } from '~front/app/resolvers/struct-rep.resolver';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import {
  constants,
  constants as frontConstants
} from '~front/barrels/constants';

export class TimeSpecItem {
  label: string;
  value: common.TimeSpecEnum;
}

@Component({
  selector: 'm-metrics',
  styleUrls: ['metrics.component.scss'],
  templateUrl: './metrics.component.html'
})
export class MetricsComponent implements OnInit {
  pageTitle = frontConstants.METRICS_PAGE_TITLE;

  isShow = true;

  emptyRepId = common.EMPTY;

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      console.log(x);
      // console.log(x.timeRangeFraction);

      this.cd.detectChanges();
    })
  );

  fractions: common.Fraction[] = [];
  timeQuery$ = this.timeQuery.select().pipe(
    tap(x => {
      this.fractions = [x.timeRangeFraction];
      this.cd.detectChanges();
    })
  );

  reps: common.RepX[];
  reps$ = this.repsQuery.select().pipe(
    tap(x => {
      this.reps = [emptyRep, ...x.reps];
      // this.reps.push(x.reps[0])

      this.cd.detectChanges();
    })
  );

  timeSpecForm = this.fb.group({
    timeSpec: [
      {
        value: undefined
      }
    ]
  });

  timezoneForm = this.fb.group({
    timezone: [
      {
        value: undefined
      }
    ]
  });

  timeSpecList: TimeSpecItem[] = [
    {
      label: 'Years',
      value: common.TimeSpecEnum.Years
    },
    {
      label: 'Quarters',
      value: common.TimeSpecEnum.Quarters
    },
    {
      label: 'Months',
      value: common.TimeSpecEnum.Months
    },
    {
      label: 'Weeks',
      value: common.TimeSpecEnum.Weeks
    },
    {
      label: 'Days',
      value: common.TimeSpecEnum.Days
    },
    {
      label: 'Hours',
      value: common.TimeSpecEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.TimeSpecEnum.Minutes
    }
  ];

  timezones = common
    .getTimezones()
    .filter(x => x.value !== common.USE_PROJECT_TIMEZONE_VALUE);

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private repsQuery: RepsQuery,
    private repQuery: RepQuery,
    private timeQuery: TimeQuery,
    private route: ActivatedRoute,
    private repService: RepService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private structRepResolver: StructRepResolver,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let timeState = this.timeQuery.getValue();

    this.timezoneForm.controls['timezone'].setValue(timeState.timezone);
    this.timeSpecForm.controls['timeSpec'].setValue(timeState.timeSpec);
    this.fractions = [timeState.timeRangeFraction];
  }

  navToRep(rep: common.RepX) {
    this.navigateService.navigateToMetricsRep({
      repId: rep.repId,
      draft: rep.draft
    });
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;
    localStorage.setItem(constants.LOCAL_STORAGE_TIMEZONE, timezone);
    this.timeQuery.updatePart({ timezone: timezone });
    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  timeSpecChange() {
    let timeSpec = this.timeSpecForm.controls['timeSpec'].value;
    localStorage.setItem(constants.LOCAL_STORAGE_TIME_SPEC, timeSpec);
    this.timeQuery.updatePart({ timeSpec: timeSpec });
    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  fractionUpdate(event$: any) {
    localStorage.setItem(
      constants.LOCAL_STORAGE_TIME_RANGE_FRACTION,
      JSON.stringify(event$.fraction)
    );

    this.timeQuery.updatePart({ timeRangeFraction: event$.fraction });

    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  deleteRep(event: any, rep: common.RepX) {
    event.stopPropagation();
    this.repService.deleteRep({ repId: rep.repId });
  }

  repSaveAs(event: any, rep: common.RepX) {
    event.stopPropagation();

    this.myDialogService.showRepSaveAs({
      apiService: this.apiService,
      reps: this.reps.filter(
        x => x.draft === false && x.repId !== common.EMPTY
      ),
      rep: rep
    });
  }
}
