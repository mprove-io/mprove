import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import { BlockmlTreeComponent } from './blockml-tree/blockml-tree.component';
import { BlockmlComponent } from './blockml.component';

@NgModule({
  declarations: [BlockmlComponent, BlockmlTreeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule
  ]
})
export class BlockmlModule {}
