import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
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
export class ColorMenuComponent implements OnDestroy, OnChanges {
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

  ngOnChanges() {
    this.rgbaColor = common.isDefined(this.color)
      ? { r: 0, g: 0, b: 0, a: 0 }
      : { r: 0, g: 0, b: 0, a: 0 };
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
    console.log($event.color);
    console.log($event.color.rgb);
  }

  apply() {
    this.closeMenu();
    this.colorChange.emit({
      color: this.color
    });
  }
}
