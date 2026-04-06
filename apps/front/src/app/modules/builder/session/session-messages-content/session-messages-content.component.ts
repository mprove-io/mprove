import { Component, Input } from '@angular/core';
import { LanguageDescription } from '@codemirror/language';
import { languages as cmLanguages } from '@codemirror/language-data';
import { Extension } from '@codemirror/state';
import type { ToolPart } from '@opencode-ai/sdk/v2';
import { VS_LIGHT_THEME_EXTRA_SINGLE_SESSION_READ } from '#common/constants/code-themes/themes';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { MyDialogService } from '../../../../services/my-dialog.service';
import {
  ChatMessage,
  ChatTurn,
  FileDiffInfo
} from '../session-chat.interfaces';

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*[A-Za-z]/g;

function stripAnsi(item: { text: string }): string {
  let { text } = item;
  return text.replace(ANSI_REGEX, '');
}

function tryFormatJson(item: { text: string }): string {
  let { text } = item;
  let trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      let parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, undefined, 2);
    } catch {
      return text;
    }
  }
  return text;
}

function extractReadContent(item: { text: string }): string {
  let { text } = item;
  let contentMatch = text.match(/<content>([\s\S]*)<\/content>/);
  if (contentMatch) {
    return contentMatch[1].trim();
  }
  return text;
}

function extractTaskResult(item: { text: string }): string {
  let { text } = item;
  let match = text.match(/<task_result>([\s\S]*)<\/task_result>/);
  if (match) {
    return match[1].trim();
  }
  return text;
}

function extractSkillContent(item: { text: string }): string {
  let { text } = item;
  let match = text.trimEnd().match(/^<(\w[\w-]*)[^>]*>([\s\S]*)<\/\1>\s*$/);
  if (match) {
    let inner = match[2].trim();
    // Remove empty XML tags (e.g., <skill_files></skill_files>)
    return inner.replace(/<(\w[\w-]*)[^>]*>\s*<\/\1>/g, '').trim();
  }
  return text;
}

function stripTrailingXmlTags(item: { text: string }): string {
  let { text } = item;
  let result = text.replace(/<(\w[\w-]*)[^>]*>[\s\S]*<\/\1>\s*$/g, '');
  if (result !== text) {
    return result.trim();
  }
  return text;
}

const TOOL_TITLE_MAP: Record<string, string> = {
  bash: 'Shell',
  read: 'Read',
  write: 'Write',
  edit: 'Edit',
  glob: 'Glob',
  grep: 'Grep',
  websearch: 'Web Search',
  webfetch: 'Web Fetch',
  task: 'Task',
  todowrite: 'Todo',
  question: 'Question',
  skill: 'Skill',
  codesearch: 'Code Search',
  apply_patch: 'Apply Patch'
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

  codeLanguages: LanguageDescription[] = cmLanguages;
  codeLanguageNames: Set<string> = new Set(
    cmLanguages.flatMap(ld => [ld.name, ...ld.alias].map(n => n.toLowerCase()))
  );
  codeTheme: Extension = VS_LIGHT_THEME_EXTRA_SINGLE_SESSION_READ;

  activatingChars = 'Activating Session...'.split('').map((char, i) => ({
    char: char === ' ' ? '\u00A0' : char,
    index: i
  }));

  getCodeLanguage(item: { lang: string }): string {
    let { lang } = item;
    if (!lang) {
      return '';
    }
    let isKnown = this.codeLanguageNames.has(lang.toLowerCase());
    return isKnown ? lang : '';
  }

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
    if (toolPart.tool === 'skill') {
      return (input['name'] as string) || '';
    }
    if (toolPart.tool === 'apply_patch') {
      let patchText = (input['patchText'] as string) || '';
      let allMatches = [
        ...patchText.matchAll(/\*\*\* (Update|Add|Delete) File: (.+)/g)
      ];
      if (allMatches.length > 1) {
        return 'multiple files';
      }
      if (allMatches.length === 1) {
        return allMatches[0][1] + ' ' + allMatches[0][2];
      }
      return '';
    }
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
    if (toolPart.state.status === 'completed')
      return tryFormatJson({
        text: stripAnsi({ text: toolPart.state.output })
      });
    if (toolPart.state.status === 'error')
      return stripAnsi({ text: toolPart.state.error });
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
    let displayOutput: string;
    if (toolPart.tool === 'read') {
      displayOutput = extractReadContent({ text: output });
    } else if (toolPart.tool === 'task') {
      displayOutput = extractTaskResult({ text: output });
    } else if (toolPart.tool === 'skill') {
      displayOutput = extractSkillContent({ text: output });
    } else if (
      toolPart.tool === 'write' ||
      toolPart.tool === 'edit' ||
      toolPart.tool === 'bash' ||
      toolPart.tool === 'apply_patch'
    ) {
      displayOutput = stripTrailingXmlTags({ text: output });
    } else {
      displayOutput = output;
    }
    let rawOutput = displayOutput !== output ? output : undefined;
    this.myDialogService.showToolOutput({
      title: this.getToolTitle(toolPart.tool),
      subtitle: this.getToolSubtitle(toolPart),
      output: displayOutput,
      rawOutput: rawOutput,
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
