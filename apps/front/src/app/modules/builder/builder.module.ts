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
import { BuilderComponent } from './builder.component';
import { BuilderLeftComponent } from './builder-left/builder-left.component';
import { FileOptionsComponent } from './builder-left/file-options/file-options.component';
import { FilesRightPanelToggleComponent } from './builder-left/files-right-panel-toggle/files-right-panel-toggle.component';
import { FolderOptionsComponent } from './builder-left/folder-options/folder-options.component';
import { BuilderRightComponent } from './builder-right/builder-right.component';
import { SessionsComponent } from './builder-right/sessions/sessions.component';
import { BlockmlErrorsComponent } from './builder-right/validation-status/blockml-errors/blockml-errors.component';
import { RepoConflictsComponent } from './builder-right/validation-status/repo-conflicts/repo-conflicts.component';
import { ValidationStatusComponent } from './builder-right/validation-status/validation-status.component';
import { FileEditorComponent } from './file-editor/file-editor.component';
import { RepoOptionsComponent } from './repo-options/repo-options.component';
import { SessionComponent } from './session/session.component';

@NgModule({
  declarations: [
    BuilderComponent,
    BuilderLeftComponent,
    FilesRightPanelToggleComponent,
    FolderOptionsComponent,
    FileOptionsComponent,
    FileEditorComponent,
    RepoOptionsComponent,
    BuilderRightComponent,
    SessionsComponent,
    SessionComponent,
    BlockmlErrorsComponent,
    RepoConflictsComponent,
    ValidationStatusComponent
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
export class BuilderModule {}
