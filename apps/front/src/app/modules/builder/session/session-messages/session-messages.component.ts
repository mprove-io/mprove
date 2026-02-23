import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import type { ToolPart } from '@opencode-ai/sdk/v2';
import { NgScrollbar } from 'ngx-scrollbar';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { MyDialogService } from '../../../../services/my-dialog.service';

interface ChatMessage {
  role: 'user' | 'agent' | 'tool' | 'thought' | 'error';
  text: string;
  toolPart?: ToolPart;
}

interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
}

const TOOL_TITLE_MAP: Record<string, string> = {
  bash: 'Shell',
  read: 'Read',
  write: 'Write',
  edit: 'Edit',
  glob: 'Glob',
  grep: 'Grep',
  web_search: 'Web Search',
  web_fetch: 'Web Fetch',
  task: 'Task',
  todo_write: 'Todo',
  notebook_edit: 'Notebook Edit',
  ask_user_question: 'Question'
};

@Component({
  standalone: false,
  selector: 'm-session-messages',
  templateUrl: './session-messages.component.html'
})
export class SessionMessagesComponent implements AfterViewInit, OnChanges {
  @Input() turns: ChatTurn[] = [];
  @Input() session: AgentSessionApi;
  @Input() isActivating = false;
  @Input() isWaitingForResponse = false;
  @Input() retryMessage: string;
  @Input() isSessionError = false;
  @Input() scrollTrigger = 0;

  @ViewChild('chatScroll') chatScrollbar: NgScrollbar;

  skipNextScroll = true;
  responseMinHeight = 0;

  ngAfterViewInit() {
    if (this.chatScrollbar) {
      let viewport = this.chatScrollbar.adapter.viewportElement;
      viewport.scrollTop = viewport.scrollHeight;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scrollTrigger'] && !changes['scrollTrigger'].firstChange) {
      this.scrollUserMessageToTop();
    }

    this.updateResponseMinHeight();
  }

  scrollUserMessageToTop() {
    if (!this.chatScrollbar) {
      return;
    }
    if (this.skipNextScroll) {
      this.skipNextScroll = false;
      setTimeout(() => {
        let viewport = this.chatScrollbar.adapter.viewportElement;
        viewport.scrollTop = viewport.scrollHeight;
      });
      return;
    }
    setTimeout(() => {
      let elements =
        this.chatScrollbar.nativeElement.querySelectorAll('.user-message');
      let lastEl = elements[elements.length - 1] as HTMLElement;
      if (lastEl) {
        this.chatScrollbar.adapter.scrollTo({ top: lastEl.offsetTop });
      }
    });
  }

  updateResponseMinHeight() {
    if (!this.chatScrollbar) {
      return;
    }
    this.responseMinHeight =
      this.chatScrollbar.nativeElement.clientHeight * 0.7;
  }

  getToolTitle(name: string): string {
    return TOOL_TITLE_MAP[name] || name;
  }

  getToolSubtitle(toolPart: ToolPart): string {
    let input = toolPart.state?.input;
    if (!input) return '';
    return (
      (input['file_path'] as string) ||
      (input['filePath'] as string) ||
      (input['pattern'] as string) ||
      (input['command'] as string) ||
      (input['description'] as string) ||
      (input['query'] as string) ||
      (input['url'] as string) ||
      ''
    );
  }

  getToolOutput(toolPart: ToolPart): string {
    if (!toolPart.state) return '';
    if (toolPart.state.status === 'completed') return toolPart.state.output;
    if (toolPart.state.status === 'error') return toolPart.state.error;
    return '';
  }

  constructor(private myDialogService: MyDialogService) {}

  openToolOutput(toolPart: ToolPart) {
    let output = this.getToolOutput(toolPart);
    if (!output) return;
    this.myDialogService.showToolOutput({
      title: this.getToolTitle(toolPart.tool),
      subtitle: this.getToolSubtitle(toolPart),
      output,
      isError: toolPart.state?.status === 'error'
    });
  }
}
