import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import { BlockmlEditorComponent } from './blockml-editor/blockml-editor.component';
import { BlockmlTreeComponent } from './blockml-tree/blockml-tree.component';
import { FileOptionsComponent } from './blockml-tree/file-options/file-options.component';
import { FolderOptionsComponent } from './blockml-tree/folder-options/folder-options.component';
import { BlockmlComponent } from './blockml.component';

@NgModule({
  declarations: [
    BlockmlComponent,
    BlockmlTreeComponent,
    FolderOptionsComponent,
    FileOptionsComponent,
    BlockmlEditorComponent
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
export class BlockmlModule {}
