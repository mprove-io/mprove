import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ReportX } from '#common/interfaces/backend/report-x';
import { FilteredReportsQuery } from '~front/app/queries/filtered-reports.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';

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

  filteredReports: ReportX[];
  filteredReports$ = this.filteredReportsQuery.select().pipe(
    tap(x => {
      this.filteredReports = x.filteredReports.filter(d => d.draft === false);
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

  trackByFn(index: number, item: ReportX) {
    return item.reportId;
  }
}
