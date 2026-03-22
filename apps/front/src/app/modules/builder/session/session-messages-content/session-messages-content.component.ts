import { Component, Input } from '@angular/core';
import type { ToolPart } from '@opencode-ai/sdk/v2';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { MyDialogService } from '../../../../services/my-dialog.service';
import {
  ChatMessage,
  ChatTurn,
  FileDiffInfo
} from '../session-chat.interfaces';

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
  selector: 'm-session-messages-content',
  templateUrl: './session-messages-content.component.html'
})
export class SessionMessagesContentComponent {
  @Input() turns: ChatTurn[] = [];
  @Input() session: SessionApi;
  @Input() isActivating = false;
  @Input() isArchived = false;
  @Input() isSessionBusy = false;
  @Input() retryMessage: string;
  @Input() isSessionError = false;
  @Input() lastSessionError: Record<string, unknown> | undefined;
  @Input() isLastErrorRecovered: boolean | undefined;

  activatingChars = 'Activating Session...'.split('').map((char, i) => ({
    char: char === ' ' ? '\u00A0' : char,
    index: i
  }));

  trackByIndex(index: number): number {
    return index;
  }

  constructor(private myDialogService: MyDialogService) {}

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

  getBashOutputPreview(toolPart: ToolPart, maxLines = 4): string {
    let output = this.getToolOutput(toolPart);
    if (!output) return '';
    let lines = output.split('\n');
    return lines.slice(0, maxLines).join('\n');
  }

  openFileDiff(diff: FileDiffInfo) {
    this.myDialogService.showFileDiffs({
      diff
    });
  }

  isAbortError(): boolean {
    return this.lastSessionError?.['name'] === 'MessageAbortedError';
  }

  getSessionErrorName(): string {
    if (!this.lastSessionError) return '';
    let name = this.lastSessionError['name'] as string | undefined;
    let data = this.lastSessionError['data'] as
      | Record<string, unknown>
      | undefined;
    let message = data?.['message'] as string | undefined;
    return message || name || 'Unknown error';
  }

  openSessionErrorDialog() {
    if (!this.lastSessionError) return;
    let name = (this.lastSessionError['name'] as string) || 'Error';
    let data = this.lastSessionError['data'] as
      | Record<string, unknown>
      | undefined;
    let message = (data?.['message'] as string) || JSON.stringify(data ?? {});
    this.myDialogService.showToolOutput({
      title: 'Session Error',
      subtitle: name,
      output: message,
      isError: true
    });
  }
}
