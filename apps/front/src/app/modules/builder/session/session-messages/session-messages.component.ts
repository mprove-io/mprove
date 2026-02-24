import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
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
export class SessionMessagesComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() turns: ChatTurn[] = [];
  @Input() session: AgentSessionApi;
  @Input() isActivating = false;
  @Input() isWaitingForResponse = false;
  @Input() retryMessage: string;
  @Input() isSessionError = false;
  @Input() scrollTrigger = 0;
  @Input() autoScroll = true;

  @ViewChild('chatScroll') chatScrollbar: NgScrollbar;

  skipNextScroll = true;
  responseMinHeight = 0;
  isAtBottom = true;
  isOverflowing = false;

  private scrollListener: (() => void) | null = null;
  private rafId: number | null = null;
  private isScrollingToBottom = false;

  ngAfterViewInit() {
    if (this.chatScrollbar) {
      let viewport = this.chatScrollbar.adapter.viewportElement;
      viewport.scrollTop = viewport.scrollHeight;

      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      });

      this.scrollListener = () => this.scheduleScrollStateUpdate();
      viewport.addEventListener('scroll', this.scrollListener, {
        passive: true
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scrollTrigger'] && !changes['scrollTrigger'].firstChange) {
      this.scrollUserMessageToTop();
    }

    this.updateResponseMinHeight();

    // Auto-scroll: when turns change WITHOUT scrollTrigger, scroll to bottom
    if (this.autoScroll && changes['turns'] && !changes['scrollTrigger']) {
      setTimeout(() => {
        if (this.chatScrollbar) {
          let viewport = this.chatScrollbar.adapter.viewportElement;
          viewport.scrollTop = viewport.scrollHeight;
        }
      });
    }

    setTimeout(() => this.updateScrollState());
  }

  ngOnDestroy() {
    if (this.scrollListener && this.chatScrollbar) {
      let viewport = this.chatScrollbar.adapter.viewportElement;
      viewport.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  scrollToBottom() {
    if (!this.chatScrollbar) {
      return;
    }
    this.isAtBottom = true;
    this.isScrollingToBottom = true;
    let viewport = this.chatScrollbar.adapter.viewportElement;
    let scrollMax = viewport.scrollHeight - viewport.clientHeight;
    this.chatScrollbar.adapter.scrollTo({ top: scrollMax, duration: 200 });
    setTimeout(() => {
      this.isScrollingToBottom = false;
      this.updateScrollState();
    }, 300);
  }

  private scheduleScrollStateUpdate() {
    if (this.rafId !== null) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateScrollState();
    });
  }

  private updateScrollState() {
    if (this.isScrollingToBottom || !this.chatScrollbar) {
      return;
    }
    let viewport = this.chatScrollbar.adapter.viewportElement;
    let max = viewport.scrollHeight - viewport.clientHeight;
    let newIsOverflowing = max > 1;
    let newIsAtBottom = !newIsOverflowing || viewport.scrollTop >= max - 2;

    if (
      this.isOverflowing !== newIsOverflowing ||
      this.isAtBottom !== newIsAtBottom
    ) {
      this.isOverflowing = newIsOverflowing;
      this.isAtBottom = newIsAtBottom;
      this.cd.detectChanges();
    }
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

  constructor(
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

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
