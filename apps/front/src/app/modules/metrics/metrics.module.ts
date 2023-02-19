import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@bugsplat/angular-tree-component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyModule } from '@ngneat/helipopper';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AgGridModule } from 'ag-grid-angular';
import { MonacoEditorModule } from 'ng-monaco-editor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { MetricsTreeComponent } from './metrics-tree/metrics-tree.component';
import { MetricsComponent } from './metrics.component';
import { RepOptionsComponent } from './rep-options/rep-options.component';
import { DataRendererComponent } from './rep/data-renderer/data-renderer.component';
import { MetricRendererComponent } from './rep/metric-renderer/metric-renderer.component';
import { RepComponent } from './rep/rep.component';
import { RowOptionsComponent } from './rep/row-options/row-options.component';
import { StatusHeaderComponent } from './rep/status-header/status-header.component';
import { StatusRendererComponent } from './rep/status-renderer/status-renderer.component';

@NgModule({
  declarations: [
    MetricsComponent,
    MetricsTreeComponent,
    RepComponent,
    RepOptionsComponent,
    RowOptionsComponent,
    MetricRendererComponent,
    StatusRendererComponent,
    DataRendererComponent,
    StatusHeaderComponent
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
    TippyModule,
    MonacoEditorModule,
    AgGridModule,
    AgChartsAngularModule
  ]
})
export class MetricsModule {}
