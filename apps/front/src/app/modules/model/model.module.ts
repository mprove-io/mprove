import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import { MainTableComponent } from './main-table/main-table.component';
import { MconfigComponent } from './mconfig/mconfig.component';
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
    MainTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule
  ]
})
export class ModelModule {}
