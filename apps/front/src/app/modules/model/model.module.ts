import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import { MconfigComponent } from './mconfig/mconfig.component';
import { ModelTreeComponent } from './model-tree/model-tree.component';
import { ModelComponent } from './model.component';
import { QueryComponent } from './query/query.component';

@NgModule({
  declarations: [
    ModelComponent,
    ModelTreeComponent,
    MconfigComponent,
    QueryComponent
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
