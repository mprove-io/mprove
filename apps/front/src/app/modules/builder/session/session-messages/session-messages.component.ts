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

interface FileDiffInfo {
  file: string;
  additions: number;
  deletions: number;
  status?: 'added' | 'deleted' | 'modified';
  before?: string;
  after?: string;
}

interface ChatMessage {
  role: 'user' | 'agent' | 'tool' | 'thought' | 'error';
  text: string;
  toolPart?: ToolPart;
  agentName?: string;
  modelId?: string;
  variant?: string;
  summaryDiffs?: FileDiffInfo[];
}

interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
  fileDiffs?: FileDiffInfo[];
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
  question: 'Question'
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
  @Input() isArchived = false;
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
  isReady = false;

  private scrollListener: (() => void) | null = null;
  private rafId: number | null = null;
  private isScrollingToBottom = false;

  ngAfterViewInit() {
    if (this.chatScrollbar) {
      let viewport = this.chatScrollbar.adapter.viewportElement;
      viewport.style.overflowAnchor = 'none';
      viewport.scrollTop = viewport.scrollHeight;

      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
        requestAnimationFrame(() => {
          this.isReady = true;
          this.cd.detectChanges();
        });
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

  hasToolContent(toolPart: ToolPart): boolean {
    if (toolPart.tool === 'write' && toolPart.state?.input?.['content']) {
      return true;
    }
    if (
      toolPart.tool === 'edit' &&
      (toolPart.state?.input?.['newString'] ||
        toolPart.state?.input?.['new_string'])
    ) {
      return true;
    }
    return !!this.getToolOutput(toolPart);
  }

  constructor(
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

  openToolOutput(toolPart: ToolPart) {
    let output: string;
    if (toolPart.tool === 'write' && toolPart.state?.input?.['content']) {
      output = toolPart.state.input['content'] as string;
    } else if (toolPart.tool === 'edit' && toolPart.state?.input) {
      let newStr =
        (toolPart.state.input['newString'] as string) ||
        (toolPart.state.input['new_string'] as string) ||
        '';
      output = newStr || this.getToolOutput(toolPart);
    } else {
      output = this.getToolOutput(toolPart);
    }
    if (!output) return;
    this.myDialogService.showToolOutput({
      title: this.getToolTitle(toolPart.tool),
      subtitle: this.getToolSubtitle(toolPart),
      output,
      isError: toolPart.state?.status === 'error'
    });
  }

  getMetaText(msg: ChatMessage): string {
    let parts: string[] = [];
    if (msg.agentName) {
      parts.push(
        msg.agentName.charAt(0).toUpperCase() + msg.agentName.slice(1)
      );
    }
    if (msg.modelId) {
      parts.push(msg.modelId);
    }
    if (msg.variant) {
      parts.push(msg.variant);
    }
    return parts.join(' \u00B7 ');
  }

  getQuestionStatus(toolPart: ToolPart): string {
    if (toolPart.state?.status === 'completed') return 'User answered';
    if (toolPart.state?.status === 'error') return 'User declined';
    return 'Waiting for user';
  }

  getTotalAdditions(diffs: FileDiffInfo[]): number {
    return diffs.reduce((sum, d) => sum + d.additions, 0);
  }

  getTotalDeletions(diffs: FileDiffInfo[]): number {
    return diffs.reduce((sum, d) => sum + d.deletions, 0);
  }

  openFileDiff(diff: FileDiffInfo) {
    this.myDialogService.showFileDiffs({
      diff
    });
  }
}
