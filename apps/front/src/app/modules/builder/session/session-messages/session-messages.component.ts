import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { NgScrollbar } from 'ngx-scrollbar';
import { NgxSpinnerService } from 'ngx-spinner';
import { makeId } from '#common/functions/make-id';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';

interface ChatMessage {
  sender: string;
  text: string;
  permissionId?: string;
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
export class SessionMessagesComponent implements OnChanges, OnDestroy {
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

  @ViewChild('chatScroll') chatScrollbar: NgScrollbar;

  responseMinHeight = 0;
  waitingSpinnerName = makeId();

  constructor(private spinner: NgxSpinnerService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scrollTrigger'] && !changes['scrollTrigger'].firstChange) {
      this.scrollUserMessageToTop();
    }

    this.updateResponseMinHeight();
    this.updateSpinners();
  }

  ngOnDestroy() {
    this.spinner.hide(this.waitingSpinnerName);
  }

  private scrollUserMessageToTop() {
    if (!this.chatScrollbar) {
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

  private updateResponseMinHeight() {
    if (!this.chatScrollbar) {
      return;
    }
    this.responseMinHeight =
      this.chatScrollbar.nativeElement.clientHeight * 0.7;
  }

  private updateSpinners() {
    if (this.isWaitingForResponse) {
      this.spinner.show(this.waitingSpinnerName);
    } else {
      this.spinner.hide(this.waitingSpinnerName);
    }
  }
}
