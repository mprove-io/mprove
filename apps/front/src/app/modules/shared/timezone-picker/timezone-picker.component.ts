import { A11yModule } from '@angular/cdk/a11y';
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
import {
  getTimezones,
  type TimezoneOption
} from '#common/functions/get-timezones/get-timezones';

@Component({
  selector: 'm-timezone-picker',
  imports: [A11yModule, OverlayModule, TippyDirective],
  templateUrl: './timezone-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezonePickerComponent {
  readonly value = input.required<string>();
  readonly isDisabled = input.required<boolean>();
  readonly testId = input.required<string>();
  readonly timezoneChange = output<string>();

  readonly positions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 8
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -8
    }
  ];

  private readonly timezones: TimezoneOption[] = getTimezones();
  private readonly labels: string[] = this.timezones.map(zone => zone.label);
  private readonly fuzzy = new uFuzzy({});

  private readonly matchingTimezones = signal<TimezoneOption[]>(this.timezones);
  readonly selectedTimezone: Signal<TimezoneOption> = computed(() => {
    let value: string = this.value();

    let timezone: TimezoneOption = this.timezones.find(
      zone => zone.value === value
    ) ?? {
      value: value,
      label: value,
      name: value
    };

    return timezone;
  });

  readonly visibleTimezones = computed(() =>
    this.matchingTimezones().filter(zone => zone.value !== this.value())
  );
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  isOpen = false;
  activeIndex = 0;

  constructor() {
    afterRenderEffect(() => {
      this.searchInput()?.nativeElement.focus();
    });
  }

  open(): void {
    this.matchingTimezones.set(this.timezones);
    this.activeIndex = 0;
    this.isOpen = true;
  }

  search(item: { term: string }): void {
    let { term } = item;

    let query: string = term.trim().toLowerCase();

    this.activeIndex = 0;

    if (query === '') {
      this.matchingTimezones.set(this.timezones);

      return;
    }

    let indices: Set<number> = new Set(this.fuzzy.filter(this.labels, query));

    this.matchingTimezones.set(
      this.timezones.filter(
        (zone, index) =>
          indices.has(index) || zone.value.toLowerCase().includes(query)
      )
    );
  }

  select(item: { timezone: string }): void {
    let { timezone } = item;

    this.isOpen = false;

    if (!this.isDisabled() && timezone !== this.value()) {
      this.timezoneChange.emit(timezone);
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
    let timezones: TimezoneOption[] = this.visibleTimezones();

    if (timezones.length > 0) {
      this.select({ timezone: timezones[0].value });
    }
  }
}
