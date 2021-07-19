import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

export class RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class ColorChange {
  color: string;
}

@Component({
  selector: 'm-color-menu',
  templateUrl: './color-menu.component.html'
})
export class ColorMenuComponent implements OnDestroy, OnInit {
  menuId = 'colorMenu';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isColorMenuOpen = false;

  @Input()
  color: string;

  rgbaColor: RgbaColor;

  @Output()
  colorChange = new EventEmitter<ColorChange>();

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let r = 255;
    let g = 255;
    let b = 255;
    let a = 1;

    // console.log('this.color');
    // console.log(this.color);

    if (common.isDefined(this.color)) {
      if (this.color.match(common.MyRegex.CAPTURE_RGB_SPLIT_G())) {
        let rgbR = common.MyRegex.CAPTURE_RGB_SPLIT_G().exec(this.color);

        r = Number(rgbR[2]);
        g = Number(rgbR[3]);
        b = Number(rgbR[4]);
      } else if (this.color.match(common.MyRegex.CAPTURE_RGBA_SPLIT_G())) {
        let rgbaR = common.MyRegex.CAPTURE_RGBA_SPLIT_G().exec(this.color);

        r = Number(rgbaR[2]);
        g = Number(rgbaR[3]);
        b = Number(rgbaR[4]);
        a = Number(rgbaR[5]);
      }
    }

    this.rgbaColor = { r: r, g: g, b: b, a: a };
    // console.log(this.rgbaColor);
  }

  openMenu() {
    this.isColorMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu() {
    this.isColorMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu() {
    if (this.isColorMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }

  onChangeComplete($event: any): void {
    // console.log($event.color);
    this.rgbaColor = $event.color.rgb;
  }

  save() {
    this.closeMenu();

    // console.log('save');
    // console.log(this.rgbaColor);

    let str = `rgba(${this.rgbaColor.r}, ${this.rgbaColor.g}, ${this.rgbaColor.b}, ${this.rgbaColor.a})`;
    // console.log(str);
    this.colorChange.emit({ color: str });
  }

  cancel() {
    this.closeMenu();
    // this.colorChange.emit({ color: this.color });
  }

  clear() {
    this.closeMenu();
    this.colorChange.emit({ color: undefined });
  }
}
