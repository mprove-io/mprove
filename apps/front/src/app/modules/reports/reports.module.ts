import { TreeModule } from '@ali-hm/angular-tree-component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { AgGridModule } from 'ag-grid-angular';
import { MonacoEditorModule } from 'ng-monaco-editor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { MetricsTreeComponent } from './metrics-tree/metrics-tree.component';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportOptionsComponent } from './report-options/report-options.component';
import { ChartHeaderComponent } from './report/chart-header/chart-header.component';
import { ChartRendererComponent } from './report/chart-renderer/chart-renderer.component';
import { DataRendererComponent } from './report/data-renderer/data-renderer.component';
import { MetricHeaderComponent } from './report/metric-header/metric-header.component';
import { MetricRendererComponent } from './report/metric-renderer/metric-renderer.component';
import { ReportComponent } from './report/report.component';
import { RowIdHeaderComponent } from './report/row-id-header/row-id-header.component';
import { RowIdRendererComponent } from './report/row-id-renderer/row-id-renderer.component';
import { StatusHeaderComponent } from './report/status-header/status-header.component';
import { StatusRendererComponent } from './report/status-renderer/status-renderer.component';
import { ReportsListComponent } from './reports-list/reports-list.component';
import { ReportsComponent } from './reports.component';
import { RowFiltersComponent } from './row-filters/row-filters.component';
import { RowComponent } from './row/row.component';

@NgModule({
  declarations: [
    ReportsComponent,
    ReportsListComponent,
    MetricsTreeComponent,
    ReportComponent,
    ReportFiltersComponent,
    RowComponent,
    ReportOptionsComponent,
    MetricRendererComponent,
    StatusRendererComponent,
    DataRendererComponent,
    StatusHeaderComponent,
    MetricHeaderComponent,
    ChartHeaderComponent,
    ChartRendererComponent,
    RowIdHeaderComponent,
    RowIdRendererComponent,
    RowFiltersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule,
    NgSelectModule,
    UiSwitchModule,
    NgxSpinnerModule,
    TippyDirective,
    MonacoEditorModule,
    AgGridModule
  ]
})
export class ReportsModule {}
