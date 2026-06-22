import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import type { ReportX } from '#common/zod/backend/report-x';
import { FilteredReportsQuery } from '#front/app/queries/filtered-reports.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

type ReportListItem = ReportX & {
  displaySpace: string;
  displayAccessRoles: { role: string; isDirect: boolean }[];
};

@Component({
  standalone: false,
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

  filteredReports: ReportListItem[];
  filteredReports$ = this.filteredReportsQuery.select().pipe(
    tap(x => {
      this.filteredReports = x.filteredReports
        .filter(d => d.draft === false)
        .map(report => {
          let accessRoles = new Set(report.accessRoles);

          return {
            ...report,
            displaySpace: report.space
              ? report.space.split('.').join(' - ')
              : '',
            displayAccessRoles: report.accessRolesCombined.map(role => ({
              role: role,
              isDirect: accessRoles.has(role)
            }))
          };
        });
      this.cd.detectChanges();
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

  trackByFn(index: number, item: ReportListItem) {
    return item.reportId;
  }
}
