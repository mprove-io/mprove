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
import { SessionInfoComponent } from './builder-left/session-info/session-info.component';
import { BuilderRightComponent } from './builder-right/builder-right.component';
import { SessionsComponent } from './builder-right/sessions/sessions.component';
import { BlockmlErrorsComponent } from './builder-right/validation-status/blockml-errors/blockml-errors.component';
import { RepoConflictsComponent } from './builder-right/validation-status/repo-conflicts/repo-conflicts.component';
import { ValidationStatusComponent } from './builder-right/validation-status/validation-status.component';
import { FileEditorComponent } from './file-editor/file-editor.component';
import { RepoOptionsComponent } from './repo-options/repo-options.component';
import { SelectFileComponent } from './select-file/select-file.component';
import { NewSessionComponent } from './session/new-session/new-session.component';
import { SessionComponent } from './session/session.component';
import { SessionDebugEventsComponent } from './session/session-debug-events/session-debug-events.component';
import { SessionInputComponent } from './session/session-input/session-input.component';
import { SessionMessagesComponent } from './session/session-messages/session-messages.component';

@NgModule({
  declarations: [
    BuilderComponent,
    BuilderLeftComponent,
    FilesRightPanelToggleComponent,
    FolderOptionsComponent,
    FileOptionsComponent,
    FileEditorComponent,
    RepoOptionsComponent,
    SelectFileComponent,
    BuilderRightComponent,
    SessionsComponent,
    NewSessionComponent,
    SessionComponent,
    SessionDebugEventsComponent,
    SessionInputComponent,
    SessionMessagesComponent,
    BlockmlErrorsComponent,
    RepoConflictsComponent,
    ValidationStatusComponent,
    SessionInfoComponent
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
