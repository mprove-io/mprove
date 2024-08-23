import { TreeModule } from '@ali-hm/angular-tree-component';
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
import { ChartEditorComponent } from './chart-editor/chart-editor.component';
import { ChartOptionsComponent } from './chart-options/chart-options.component';
import { MconfigComponent } from './mconfig/mconfig.component';
import { ModelFiltersComponent } from './model-filters/model-filters.component';
import { FieldOptionsComponent } from './model-tree/field-options/field-options.component';
import { ModelTreeComponent } from './model-tree/model-tree.component';
import { ModelComponent } from './model.component';
import { PanelTitleComponent } from './panel-title/panel-title.component';
import { QueryOptionsComponent } from './query-options/query-options.component';
import { QueryComponent } from './query/query.component';
import { SqlComponent } from './sql/sql.component';

@NgModule({
  declarations: [
    ModelComponent,
    ModelTreeComponent,
    MconfigComponent,
    QueryComponent,
    PanelTitleComponent,
    SqlComponent,
    FieldOptionsComponent,
    ModelFiltersComponent,
    QueryOptionsComponent,
    ChartOptionsComponent,
    ChartEditorComponent
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
    MonacoEditorModule
  ]
})
export class ModelModule {}
