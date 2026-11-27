import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'ng-select[railPickerPopup]',
  exportAs: 'railPickerPopup'
})
export class RailPickerPopupDirective {
  private readonly triggerRef = inject<ElementRef<HTMLElement>>(ElementRef);

  positionPopup(): void {
    let trigger: HTMLElement = this.triggerRef.nativeElement;

    let shell: HTMLElement = trigger.closest('.mprove-shell');

    if (!shell) {
      return;
    }

    let triggerRect: DOMRect = trigger.getBoundingClientRect();
    let shellRect: DOMRect = shell.getBoundingClientRect();
    let style: CSSStyleDeclaration = getComputedStyle(shell);
    let endOffset: number =
      style.direction === 'rtl'
        ? triggerRect.left - shellRect.left
        : shellRect.right - triggerRect.right;

    shell.style.setProperty('--rail-picker-popup-end', `${endOffset}px`);
    shell.style.setProperty(
      '--rail-picker-popup-top',
      `${triggerRect.bottom - shellRect.top}px`
    );
  }
}
