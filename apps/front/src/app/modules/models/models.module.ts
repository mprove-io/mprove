import { CodeEditor } from '@acrodata/code-editor';
import { TreeModule } from '@ali-hm/angular-tree-component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { ChartOptionsComponent } from './chart-options/chart-options.component';
import { ChartComponent } from './chart/chart.component';
import { ChartsListComponent } from './charts-list/charts-list.component';
import { ModelFiltersComponent } from './model-filters/model-filters.component';
import { ModelTreeComponent } from './model-tree/model-tree.component';
import { ModelComponent } from './model/model.component';
import { ModelsListComponent } from './models-list/models-list.component';
import { ModelsComponent } from './models.component';
import { PanelTitleComponent } from './panel-title/panel-title.component';
import { QueryInfoViewerComponent } from './query-info-viewer/query-info-viewer.component';
import { QueryOptionsComponent } from './query-options/query-options.component';

@NgModule({
  declarations: [
    ModelsComponent,
    ChartsListComponent,
    ModelsListComponent,
    ModelComponent,
    ModelTreeComponent,
    ChartComponent,
    PanelTitleComponent,
    QueryInfoViewerComponent,
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
    ScrollingModule,
    CodeEditor,
    NgScrollbarModule
  ]
})
export class ModelsModule {}
