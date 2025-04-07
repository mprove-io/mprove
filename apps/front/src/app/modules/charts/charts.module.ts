import { TreeModule } from '@ali-hm/angular-tree-component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { MonacoEditorModule } from 'ng-monaco-editor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { ChartOptionsComponent } from './chart-options/chart-options.component';
import { ChartComponent } from './chart/chart.component';
import { ChartsListComponent } from './charts-list/charts-list.component';
import { ChartsComponent } from './charts.component';
import { JsViewerComponent } from './js-viewer/js-viewer.component';
import { JsonViewerComponent } from './json-viewer/json-viewer.component';
import { MdlComponent } from './mdl/mdl.component';
import { ModelFiltersComponent } from './model-filters/model-filters.component';
import { FieldOptionsComponent } from './model-tree/field-options/field-options.component';
import { ModelTreeComponent } from './model-tree/model-tree.component';
import { ModelsListComponent } from './models-list/models-list.component';
import { PanelTitleComponent } from './panel-title/panel-title.component';
import { QueryOptionsComponent } from './query-options/query-options.component';
import { QueryComponent } from './query/query.component';
import { SqlComponent } from './sql/sql.component';

@NgModule({
  declarations: [
    ChartsComponent,
    ChartsListComponent,
    ModelsListComponent,
    MdlComponent,
    ModelTreeComponent,
    ChartComponent,
    QueryComponent,
    PanelTitleComponent,
    SqlComponent,
    JsViewerComponent,
    JsonViewerComponent,
    FieldOptionsComponent,
    ModelFiltersComponent,
    QueryOptionsComponent,
    ChartOptionsComponent
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
    ScrollingModule
  ]
})
export class ChartsModule {}
