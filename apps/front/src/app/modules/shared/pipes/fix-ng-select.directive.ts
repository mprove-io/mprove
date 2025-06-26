import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Directive({
  selector: '[fixNgSelectBottom]',
  standalone: false
})
export class FixNgSelectDirective {
  @Input() fixNgSelectBottom: NgSelectComponent;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    if (!this.fixNgSelectBottom) return;

    const overlay = this.renderer.createElement('div');

    this.renderer.setStyle(overlay, 'position', 'absolute');
    this.renderer.setStyle(overlay, 'bottom', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'right', '0');
    this.renderer.setStyle(overlay, 'height', '2px');
    this.renderer.setStyle(overlay, 'background', 'transparent');
    this.renderer.setStyle(overlay, 'z-index', '10');

    this.renderer.appendChild(this.elementRef.nativeElement, overlay);

    this.renderer.listen(overlay, 'click', (event: MouseEvent) => {
      event.stopPropagation();
    });
  }
}
