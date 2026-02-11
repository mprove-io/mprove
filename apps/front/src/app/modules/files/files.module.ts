import { CodeEditor, DiffEditor } from '@acrodata/code-editor';
import { TreeModule } from '@ali-hm/angular-tree-component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../shared/shared.module';
import { FileEditorComponent } from './file-editor/file-editor.component';
import { FilesComponent } from './files.component';
import { BlockmlErrorsComponent } from './files-right/blockml-errors/blockml-errors.component';
import { FilesRightComponent } from './files-right/files-right.component';
import { RepoConflictsComponent } from './files-right/repo-conflicts/repo-conflicts.component';
import { FilesSessionsComponent } from './files-sessions/files-sessions.component';
import { FileOptionsComponent } from './files-tree/file-options/file-options.component';
import { FilesRightPanelToggleComponent } from './files-tree/files-right-panel-toggle/files-right-panel-toggle.component';
import { FilesTreeComponent } from './files-tree/files-tree.component';
import { FolderOptionsComponent } from './files-tree/folder-options/folder-options.component';
import { RepoOptionsComponent } from './repo-options/repo-options.component';

@NgModule({
  declarations: [
    FilesComponent,
    FilesTreeComponent,
    FilesRightPanelToggleComponent,
    FolderOptionsComponent,
    FileOptionsComponent,
    FileEditorComponent,
    RepoOptionsComponent,
    FilesRightComponent,
    FilesSessionsComponent,
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
    TippyDirective,
    CodeEditor,
    DiffEditor,
    NgSelectModule,
    NgxSpinnerModule,
    NgScrollbarModule
  ]
})
export class FilesModule {}
