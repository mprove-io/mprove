import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[singleClick]'
})
export class SingleClickDirective {

  constructor() { }

  @HostListener('click', ['$event'])
  clickEvent(event: any) {
    event.srcElement.setAttribute('disabled', true);
    setTimeout(
      () => {
        event.srcElement.removeAttribute('disabled');
      },
      500);
  }
}
