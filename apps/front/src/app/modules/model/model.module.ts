import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { MainTableComponent } from './main-table/main-table.component';
import { MconfigComponent } from './mconfig/mconfig.component';
import { ModelBricksComponent } from './model-bricks/model-bricks.component';
import { ModelFiltersComponent } from './model-filters/model-filters.component';
import { FieldOptionsComponent } from './model-tree/field-options/field-options.component';
import { ModelTreeComponent } from './model-tree/model-tree.component';
import { ModelComponent } from './model.component';
import { PanelTitleComponent } from './panel-title/panel-title.component';
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
    ModelBricksComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule,
    NgSelectModule
  ]
})
export class ModelModule {}
