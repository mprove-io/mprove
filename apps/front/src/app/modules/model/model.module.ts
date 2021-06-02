import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import { ModelComponent } from './model.component';

@NgModule({
  declarations: [ModelComponent],
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
