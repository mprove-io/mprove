import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs';
import { ModelQuery } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { emptyRep, RepQuery } from '~front/app/queries/rep.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DataSizeService } from '~front/app/services/data-size.service';
import { FileService } from '~front/app/services/file.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { StructService } from '~front/app/services/struct.service';
import { TimeService } from '~front/app/services/time.service';
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

  rep: common.Rep;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      console.log('x.timeRangeFraction');
      console.log(x.timeRangeFraction);
      // if (common.isDefined(x.timeSpec)) {
      //   localStorage.setItem(constants.LOCAL_STORAGE_TIME_SPEC, x.timeSpec);
      //   this.timeSpecForm.controls['timeSpec'].setValue(x.timeSpec);
      // }

      // if (common.isDefined(x.timezone)) {
      //   localStorage.setItem(constants.LOCAL_STORAGE_TIMEZONE, x.timezone);
      //   this.timezoneForm.controls['timezone'].setValue(x.timezone);
      // }

      // if (common.isDefined(x.timeRangeFraction)) {
      //   localStorage.setItem(
      //     constants.LOCAL_STORAGE_TIME_RANGE_FRACTION,
      //     JSON.stringify(x.timeRangeFraction)
      //   );
      //   this.fraction = x.timeRangeFraction;
      // }

      this.cd.detectChanges();
    })
  );

  fraction: common.Fraction;

  reps: common.Rep[];
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
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private repsQuery: RepsQuery,
    private repQuery: RepQuery,
    private navQuery: NavQuery,
    private modelQuery: ModelQuery,
    private userQuery: UserQuery,
    private mqQuery: MqQuery,
    private repoQuery: RepoQuery,
    private apiService: ApiService,
    private structQuery: StructQuery,
    private fileService: FileService,
    private structService: StructService,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private timeService: TimeService,
    private mconfigService: MconfigService,
    private dataSizeService: DataSizeService,
    private queryService: QueryService,
    private myDialogService: MyDialogService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let timezone =
      localStorage.getItem(constants.LOCAL_STORAGE_TIMEZONE) ||
      this.structService.getTimezone();

    this.timezoneForm.controls['timezone'].setValue(timezone);

    let timeSpec =
      localStorage.getItem(constants.LOCAL_STORAGE_TIME_SPEC) ||
      constants.DEFAULT_TIME_SPEC;

    this.timeSpecForm.controls['timeSpec'].setValue(timeSpec);

    let timeRangeFractionStr = localStorage.getItem(
      constants.LOCAL_STORAGE_TIME_RANGE_FRACTION
    );

    this.fraction = common.isDefined(timeRangeFractionStr)
      ? JSON.parse(timeRangeFractionStr)
      : constants.DEFAULT_TIME_RANGE_FRACTION;
  }

  navToRep(repId: string) {
    this.navigateService.navigateToMetricsRep({ repId: repId });
  }

  timeSpecChange() {
    let timeSpec = this.timeSpecForm.controls['timeSpec'].value;
    localStorage.setItem(constants.LOCAL_STORAGE_TIME_SPEC, timeSpec);
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;
    localStorage.setItem(constants.LOCAL_STORAGE_TIMEZONE, timezone);
  }

  fractionUpdate(event$: any) {
    console.log(event$);

    localStorage.setItem(
      constants.LOCAL_STORAGE_TIME_RANGE_FRACTION,
      JSON.stringify(event$.fraction)
    );
  }
}
