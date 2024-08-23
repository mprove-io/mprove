import { TreeModule } from '@ali-hm/angular-tree-component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { AgCharts } from 'ag-charts-angular';
import { AgGridModule } from 'ag-grid-angular';
import { MonacoEditorModule } from 'ng-monaco-editor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { MetricsTreeComponent } from './metrics-tree/metrics-tree.component';
import { MetricsComponent } from './metrics.component';
import { ParameterFormulaComponent } from './parameter-formula/parameter-formula.component';
import { RepOptionsComponent } from './rep-options/rep-options.component';
import { ChartHeaderComponent } from './rep/chart-header/chart-header.component';
import { ChartRendererComponent } from './rep/chart-renderer/chart-renderer.component';
import { ChartSettingsComponent } from './rep/chart-settings/chart-settings.component';
import { DataRendererComponent } from './rep/data-renderer/data-renderer.component';
import { MetricHeaderComponent } from './rep/metric-header/metric-header.component';
import { MetricRendererComponent } from './rep/metric-renderer/metric-renderer.component';
import { ParametersHeaderComponent } from './rep/parameters-header/parameters-header.component';
import { ParametersRendererComponent } from './rep/parameters-renderer/parameters-renderer.component';
import { RepComponent } from './rep/rep.component';
import { RowIdHeaderComponent } from './rep/row-id-header/row-id-header.component';
import { RowIdRendererComponent } from './rep/row-id-renderer/row-id-renderer.component';
import { StatusHeaderComponent } from './rep/status-header/status-header.component';
import { StatusRendererComponent } from './rep/status-renderer/status-renderer.component';
import { RowFiltersComponent } from './row-filters/row-filters.component';
import { RowComponent } from './row/row.component';

@NgModule({
  declarations: [
    MetricsComponent,
    MetricsTreeComponent,
    RepComponent,
    RowComponent,
    RepOptionsComponent,
    MetricRendererComponent,
    ParametersRendererComponent,
    StatusRendererComponent,
    DataRendererComponent,
    StatusHeaderComponent,
    MetricHeaderComponent,
    ChartHeaderComponent,
    ChartRendererComponent,
    ChartSettingsComponent,
    RowIdHeaderComponent,
    RowIdRendererComponent,
    RowFiltersComponent,
    ParameterFormulaComponent,
    ParametersHeaderComponent
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
    AgGridModule,
    AgCharts
  ]
})
export class MetricsModule {}
