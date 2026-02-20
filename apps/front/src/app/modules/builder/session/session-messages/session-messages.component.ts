import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { NgScrollbar } from 'ngx-scrollbar';
import type { QuestionRequest } from '#common/interfaces/backend/agent-event-api';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';

interface ChatMessage {
  sender: string;
  text: string;
  permissionId?: string;
  questionId?: string;
  question?: QuestionRequest;
}

interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
}

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
  @Input() isSessionError = false;
  @Input() scrollTrigger = 0;

  @Output() permissionResponse = new EventEmitter<{
    permissionId: string;
    reply: string;
  }>();

  @Output() questionResponse = new EventEmitter<{
    questionId: string;
    answers: string[][];
  }>();

  @Output() questionReject = new EventEmitter<{
    questionId: string;
  }>();

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
}
