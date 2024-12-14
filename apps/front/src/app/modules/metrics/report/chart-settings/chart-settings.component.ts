import { ChangeDetectorRef, Component } from '@angular/core';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiService } from '~front/app/services/ui.service';

@Component({
  selector: 'm-chart-settings',
  templateUrl: './chart-settings.component.html'
})
export class ChartSettingsComponent {
  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private reportQuery: ReportQuery
  ) {}
}
