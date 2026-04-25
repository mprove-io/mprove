import { CodeEditor, DiffEditor } from '@acrodata/code-editor';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { RemarkModule } from 'ngx-remark';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { NewSessionComponent } from './new-session/new-session.component';
import { NewSessionWrapperComponent } from './new-session-wrapper/new-session-wrapper.component';
import { QuestionPromptComponent } from './question-prompt/question-prompt.component';
import { SessionComponent } from './session.component';
import { SessionDebugEventsComponent } from './session-debug-events/session-debug-events.component';
import { AutoAcceptToggleComponent } from './session-input/auto-accept-toggle/auto-accept-toggle.component';
import { ContextUsageCircleComponent } from './session-input/context-usage-circle/context-usage-circle.component';
import { SessionInputComponent } from './session-input/session-input.component';
import { SessionMessagesComponent } from './session-messages/session-messages.component';
import { SessionMessagesContentComponent } from './session-messages-content/session-messages-content.component';
import { SessionWrapperComponent } from './session-wrapper/session-wrapper.component';

@NgModule({
  declarations: [
    NewSessionComponent,
    NewSessionWrapperComponent,
    SessionComponent,
    SessionWrapperComponent,
    SessionDebugEventsComponent,
    SessionInputComponent,
    AutoAcceptToggleComponent,
    ContextUsageCircleComponent,
    QuestionPromptComponent,
    SessionMessagesContentComponent,
    SessionMessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TippyDirective,
    CodeEditor,
    DiffEditor,
    NgSelectModule,
    NgxSpinnerModule,
    NgScrollbarModule,
    UiSwitchModule,
    ...RemarkModule
  ],
  exports: [
    NewSessionComponent,
    NewSessionWrapperComponent,
    SessionComponent,
    SessionWrapperComponent,
    SessionDebugEventsComponent,
    SessionInputComponent,
    AutoAcceptToggleComponent,
    ContextUsageCircleComponent,
    QuestionPromptComponent,
    SessionMessagesContentComponent,
    SessionMessagesComponent
  ]
})
export class ChatModule {}
