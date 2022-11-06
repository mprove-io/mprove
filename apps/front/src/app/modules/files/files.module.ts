import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@bugsplat/angular-tree-component';
import { TippyModule } from '@ngneat/helipopper';
import { MonacoEditorModule } from 'ng-monaco-editor';
import { SharedModule } from '../shared/shared.module';
import { FileEditorComponent } from './file-editor/file-editor.component';
import { BlockmlErrorsComponent } from './files-right/blockml-errors/blockml-errors.component';
import { FilesRightComponent } from './files-right/files-right.component';
import { RepoConflictsComponent } from './files-right/repo-conflicts/repo-conflicts.component';
import { FileOptionsComponent } from './files-tree/file-options/file-options.component';
import { FilesTreeComponent } from './files-tree/files-tree.component';
import { FolderOptionsComponent } from './files-tree/folder-options/folder-options.component';
import { FilesComponent } from './files.component';
import { RepoOptionsComponent } from './repo-options/repo-options.component';

@NgModule({
  declarations: [
    FilesComponent,
    FilesTreeComponent,
    FolderOptionsComponent,
    FileOptionsComponent,
    FileEditorComponent,
    RepoOptionsComponent,
    FilesRightComponent,
    BlockmlErrorsComponent,
    RepoConflictsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule,
    TippyModule,
    MonacoEditorModule
  ]
})
export class FilesModule {}
