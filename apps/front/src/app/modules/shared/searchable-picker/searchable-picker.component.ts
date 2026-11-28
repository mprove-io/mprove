import {
  A11yModule,
  type InputModality,
  InputModalityDetector
} from '@angular/cdk/a11y';
import { type ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  output,
  type Signal,
  signal,
  viewChild
} from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { TippyDirective } from '@ngneat/helipopper';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export type SearchablePickerOption = {
  value: string;
  label: string;
  name?: string;
};

@Component({
  selector: 'm-searchable-picker',
  imports: [A11yModule, OverlayModule, TippyDirective],
  templateUrl: './searchable-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchablePickerComponent {
  readonly options = input.required<SearchablePickerOption[]>();
  readonly value = input<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly isDisabled = input(false);
  readonly disabledTooltip = input('');
  readonly emptyMessage = input.required<string>();
  readonly testId = input.required<string>();
  readonly align = input<'start' | 'end'>('end');
  readonly valueChange = output<string>();
  readonly isTriggerFocusRestored = signal(false);

  readonly positions = computed<ConnectedPosition[]>(() => [
    {
      originX: this.align(),
      originY: 'bottom',
      overlayX: this.align(),
      overlayY: 'top',
      offsetY: 8
    },
    {
      originX: this.align(),
      originY: 'top',
      overlayX: this.align(),
      overlayY: 'bottom',
      offsetY: -8
    }
  ]);

  private readonly fuzzy = new uFuzzy({});
  private readonly term = signal('');
  private readonly labels = computed(() =>
    this.options().map(option => option.label)
  );

  readonly selectedOption: Signal<SearchablePickerOption> = computed(() => {
    let value: string = this.value();

    let option: SearchablePickerOption = isUndefined(value)
      ? undefined
      : (this.options().find(option => option.value === value) ?? {
          value: value,
          label: value
        });

    return option;
  });

  readonly visibleOptions: Signal<SearchablePickerOption[]> = computed(() => {
    let query: string = this.term();
    let value: string = this.value();
    let options: SearchablePickerOption[] = this.options();

    let indexSet: Set<number> =
      query === ''
        ? undefined
        : new Set(this.fuzzy.filter(this.labels(), query));

    let visibleOptions: SearchablePickerOption[] = options.filter(
      (option, index) =>
        option.value !== value &&
        (isUndefined(indexSet) ||
          indexSet.has(index) ||
          option.value.toLowerCase().includes(query))
    );

    return visibleOptions;
  });

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');
  isOpen = false;
  activeIndex = 0;

  constructor(private inputModalityDetector: InputModalityDetector) {
    afterRenderEffect(() => {
      this.searchInput()?.nativeElement.focus();
    });
  }

  open(): void {
    this.term.set('');
    this.activeIndex = 0;
    this.isOpen = true;
  }

  search(item: { term: string }): void {
    let { term } = item;

    this.term.set(term.trim().toLowerCase());
    this.activeIndex = 0;
  }

  close(): void {
    this.isOpen = false;

    let modality: InputModality = this.inputModalityDetector.mostRecentModality;

    if (modality === 'mouse' || modality === 'touch') {
      this.trigger()?.nativeElement.blur();
    } else {
      this.isTriggerFocusRestored.set(true);
      this.trigger()?.nativeElement.focus();
    }
  }

  select(item: { value: string }): void {
    let { value } = item;

    this.close();

    if (!this.isDisabled() && value !== this.value()) {
      this.valueChange.emit(value);
    }
  }

  moveFocus(item: {
    event: KeyboardEvent;
    input: HTMLInputElement;
    resultList: HTMLDivElement;
  }): void {
    let { event, input, resultList } = item;

    if (event.isComposing) {
      return;
    }

    if (event.target === input && event.key === 'Enter') {
      event.preventDefault();
      this.selectFirst();

      return;
    }

    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(event.key) < 0) {
      return;
    }

    let buttons: HTMLButtonElement[] = Array.from(
      resultList.querySelectorAll('button')
    );

    if (event.target === input) {
      if (event.key === 'ArrowDown' && buttons.length > 0) {
        event.preventDefault();
        buttons[0].focus();
      }

      return;
    }

    let index: number = buttons.findIndex(button => button === event.target);

    if (index < 0) {
      return;
    }

    event.preventDefault();

    if (event.key === 'ArrowDown') {
      buttons[index + 1]?.focus();
    } else if (event.key === 'ArrowUp') {
      (buttons[index - 1] ?? input).focus();
    } else if (event.key === 'Home') {
      buttons[0]?.focus();
    } else if (event.key === 'End') {
      buttons[buttons.length - 1]?.focus();
    }
  }

  private selectFirst(): void {
    let options: SearchablePickerOption[] = this.visibleOptions();

    if (options.length > 0) {
      this.select({ value: options[0].value });
    }
  }
}
