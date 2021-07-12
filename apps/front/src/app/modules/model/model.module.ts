import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SharedModule } from '../shared/shared.module';
import { ChartEditorComponent } from './chart-editor/chart-editor.component';
import { ChartOptionsComponent } from './chart-options/chart-options.component';
import { MainTableComponent } from './main-table/main-table.component';
import { MconfigComponent } from './mconfig/mconfig.component';
import { ModelBricksComponent } from './model-bricks/model-bricks.component';
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
    MainTableComponent,
    FieldOptionsComponent,
    ModelFiltersComponent,
    ModelBricksComponent,
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
    NzToolTipModule
  ]
})
export class ModelModule {}
