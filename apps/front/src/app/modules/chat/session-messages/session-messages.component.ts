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
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
  standalone: false,
  selector: 'm-session-messages',
  templateUrl: './session-messages.component.html'
})
export class SessionMessagesComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() scrollTrigger = 0;

  @ViewChild('chatScroll') chatScrollbar: NgScrollbar;

  isAtBottom = true;
  isOverflowing = false;
  isAutoScrollEnabled = true;
  isReady = false;

  private scrollListener: (() => void) | null = null;
  private rafId: number | null = null;
  private isScrollingToBottom = false;
  private mutationObserver: MutationObserver | null = null;
  private autoScrollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private cd: ChangeDetectorRef) {}

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

      this.mutationObserver = new MutationObserver(() => {
        if (this.isAutoScrollEnabled) {
          this.scheduleAutoScroll();
        }
      });
      this.mutationObserver.observe(viewport, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scrollTrigger'] && !changes['scrollTrigger'].firstChange) {
      this.scrollToBottom();
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
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    if (this.autoScrollTimeout !== null) {
      clearTimeout(this.autoScrollTimeout);
      this.autoScrollTimeout = null;
    }
  }

  scrollToBottom() {
    if (!this.chatScrollbar) {
      return;
    }
    this.isAutoScrollEnabled = true;
    this.cd.detectChanges();
    this.scheduleAutoScroll();
  }

  private scheduleAutoScroll() {
    if (this.autoScrollTimeout !== null) {
      clearTimeout(this.autoScrollTimeout);
    }
    this.autoScrollTimeout = setTimeout(() => {
      this.autoScrollTimeout = null;
      this.autoScrollToBottom();
    }, 50);
  }

  private autoScrollToBottom() {
    if (
      !this.isAutoScrollEnabled ||
      !this.chatScrollbar ||
      this.isScrollingToBottom
    ) {
      return;
    }
    this.isScrollingToBottom = true;
    let viewport = this.chatScrollbar.adapter.viewportElement;
    let scrollMax = viewport.scrollHeight - viewport.clientHeight;
    this.chatScrollbar.adapter.scrollTo({ top: scrollMax, duration: 200 });
    setTimeout(() => {
      this.isScrollingToBottom = false;
      this.updateScrollState();
    }, 250);
  }

  private scheduleScrollStateUpdate() {
    if (this.rafId !== null) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateScrollState(true);
    });
  }

  private updateScrollState(fromUserScroll = false) {
    if (this.isScrollingToBottom || !this.chatScrollbar) {
      return;
    }
    let viewport = this.chatScrollbar.adapter.viewportElement;
    let max = viewport.scrollHeight - viewport.clientHeight;
    let newIsOverflowing = max > 1;
    let newIsAtBottom = !newIsOverflowing || viewport.scrollTop >= max - 2;

    let changed =
      this.isOverflowing !== newIsOverflowing ||
      this.isAtBottom !== newIsAtBottom;

    this.isOverflowing = newIsOverflowing;
    this.isAtBottom = newIsAtBottom;

    if (fromUserScroll) {
      this.isAutoScrollEnabled = newIsAtBottom;
    }

    if (changed) {
      this.cd.detectChanges();
    }
  }
}
