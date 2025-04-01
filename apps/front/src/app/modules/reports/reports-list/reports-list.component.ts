import { ChangeDetectorRef, Component } from '@angular/core';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

import { tap } from 'rxjs/operators';
import { FilteredReportsQuery } from '~front/app/queries/filtered-reports.query';

@Component({
  selector: 'm-reports-list',
  templateUrl: './reports-list.component.html'
})
export class ReportsListComponent {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  filteredReports: common.ReportX[];
  filteredReports$ = this.filteredReportsQuery.select().pipe(
    tap(x => {
      this.filteredReports = x.filteredReports.filter(d => d.draft === false);
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private filteredReportsQuery: FilteredReportsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService
  ) {}

  navigateToReport(reportId: string) {
    this.navigateService.navigateToReport({
      reportId: reportId,
      skipDeselect: true
    });
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToReportFile(event: any, report: common.ReportX) {
    event.stopPropagation();

    let fileIdAr = report.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  deleteReport(event: MouseEvent, item: common.ReportX) {
    event.stopPropagation();

    this.myDialogService.showDeleteReport({
      report: item,
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      isStartSpinnerUntilNavEnd: false
    });
  }

  trackByFn(index: number, item: common.ReportX) {
    return item.reportId;
  }
}
