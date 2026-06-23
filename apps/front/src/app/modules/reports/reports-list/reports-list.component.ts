import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import { FilteredReportsQuery } from '#front/app/queries/filtered-reports.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { NavigateService } from '#front/app/services/navigate.service';

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

  filteredReports: ReportUnit[];
  filteredReports$ = this.filteredReportsQuery.select().pipe(
    tap(x => {
      this.filteredReports = x.filteredReports.filter(
        report => report.draft === false
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private filteredReportsQuery: FilteredReportsQuery,
    private navigateService: NavigateService
  ) {}

  navigateToReport(reportId: string) {
    this.navigateService.navigateToReport({
      reportId: reportId,
      skipDeselect: true
    });
  }

  trackByFn(index: number, item: ReportUnit) {
    return item.reportId;
  }
}
