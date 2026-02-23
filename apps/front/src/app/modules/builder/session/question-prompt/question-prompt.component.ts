import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import type { QuestionRequest } from '@opencode-ai/sdk/v2';

@Component({
  standalone: false,
  selector: 'm-question-prompt',
  templateUrl: './question-prompt.component.html'
})
export class QuestionPromptComponent implements OnChanges {
  @Input() question: QuestionRequest;
  @Output() answer = new EventEmitter<string[][]>();
  @Output() reject = new EventEmitter<void>();

  @ViewChildren('customInput') customInputRefs: QueryList<ElementRef>;

  answers: string[][] = [];
  customInputs: string[] = [];
  customFocused: boolean[] = [];

  ngOnChanges() {
    this.answers = (this.question?.questions || []).map((): string[] => []);
    this.customInputs = (this.question?.questions || []).map((): string => '');
    this.customFocused = (this.question?.questions || []).map(
      (): boolean => false
    );
  }

  isSelected(qIdx: number, optionLabel: string): boolean {
    return this.answers[qIdx]?.includes(optionLabel) || false;
  }

  isCustomActive(qIdx: number): boolean {
    if (this.customFocused[qIdx]) return true;
    return !!this.customInputs[qIdx]?.trim();
  }

  selectOption(qIdx: number, optionLabel: string) {
    let q = this.question?.questions?.[qIdx];
    if (!q) return;

    if (!q.multiple) {
      this.customInputs[qIdx] = '';
      this.customFocused[qIdx] = false;
    }

    if (q.multiple) {
      let existing = this.answers[qIdx] ?? [];
      let next = [...existing];
      let idx = next.indexOf(optionLabel);
      if (idx === -1) {
        next.push(optionLabel);
      } else {
        next.splice(idx, 1);
      }
      this.answers[qIdx] = next;
    } else {
      this.answers[qIdx] = [optionLabel];
    }
  }

  onCustomFocus(qIdx: number) {
    let q = this.question?.questions?.[qIdx];
    if (!q) return;

    this.customFocused[qIdx] = true;

    if (!q.multiple) {
      let value = this.customInputs[qIdx]?.trim();
      this.answers[qIdx] = value ? [value] : [];
    }
  }

  onCustomBlur(qIdx: number) {
    let value = this.customInputs[qIdx]?.trim();
    if (!value) {
      this.customFocused[qIdx] = false;
    }
  }

  onCustomInput(qIdx: number, value: string) {
    let q = this.question?.questions?.[qIdx];
    if (!q) return;

    let prevValue = this.customInputs[qIdx]?.trim();
    this.customInputs[qIdx] = value;
    let newValue = value.trim();

    if (q.multiple) {
      let existing = this.answers[qIdx] ?? [];
      let next = [...existing];
      if (prevValue) {
        next = next.filter(v => v !== prevValue);
      }
      if (newValue) {
        next.push(newValue);
      }
      this.answers[qIdx] = next;
    } else {
      if (newValue) {
        this.answers[qIdx] = [newValue];
      } else {
        this.answers[qIdx] = [];
      }
    }
  }

  toggleCustom(qIdx: number) {
    if (this.isCustomActive(qIdx)) {
      let prevValue = this.customInputs[qIdx]?.trim();
      this.customInputs[qIdx] = '';
      this.customFocused[qIdx] = false;
      if (prevValue) {
        let existing = this.answers[qIdx] ?? [];
        this.answers[qIdx] = existing.filter(v => v !== prevValue);
      }
    } else {
      let inputEl = this.customInputRefs?.toArray()[qIdx]?.nativeElement;
      if (inputEl) {
        inputEl.focus();
      }
    }
  }

  submit() {
    this.answer.emit(this.answers);
  }

  dismiss() {
    this.reject.emit();
  }
}
