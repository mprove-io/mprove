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
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;

    if (common.isDefined(this.color)) {
      if (this.color.match(common.MyRegex.CAPTURE_RGB_G())) {
        let rgbR = common.MyRegex.CAPTURE_RGB_G().exec(this.color);

        r = Number(rgbR[1]);
        g = Number(rgbR[2]);
        b = Number(rgbR[3]);
      } else if (this.color.match(common.MyRegex.CAPTURE_RGBA_G())) {
        let rgbaR = common.MyRegex.CAPTURE_RGBA_G().exec(this.color);

        r = Number(rgbaR[1]);
        g = Number(rgbaR[2]);
        b = Number(rgbaR[3]);
        a = Number(rgbaR[4]);
      }
    }

    this.rgbaColor = { r: r, g: g, b: b, a: a };
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

  apply() {
    this.closeMenu();
    let str = `rgba(${this.rgbaColor.r}, ${this.rgbaColor.g}, ${this.rgbaColor.b}, ${this.rgbaColor.a})`;
    this.colorChange.emit({ color: str });
  }
}
