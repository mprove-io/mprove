import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
  standalone: false,
  selector: 'm-color-menu',
  templateUrl: './color-menu.component.html'
})
export class ColorMenuComponent implements OnInit {
  @Input()
  color: string;

  rgbaColor: RgbaColor;

  @Output()
  colorChange = new EventEmitter<ColorChange>();

  constructor() {}

  ngOnInit() {
    let r = 255;
    let g = 255;
    let b = 255;
    let a = 1;

    // console.log('this.color');
    // console.log(this.color);

    if (isDefined(this.color)) {
      if (this.color.match(MyRegex.CAPTURE_RGB_SPLIT_G())) {
        let rgbR = MyRegex.CAPTURE_RGB_SPLIT_G().exec(this.color);

        r = Number(rgbR[2]);
        g = Number(rgbR[3]);
        b = Number(rgbR[4]);
      } else if (this.color.match(MyRegex.CAPTURE_RGBA_SPLIT_G())) {
        let rgbaR = MyRegex.CAPTURE_RGBA_SPLIT_G().exec(this.color);

        r = Number(rgbaR[2]);
        g = Number(rgbaR[3]);
        b = Number(rgbaR[4]);
        a = Number(rgbaR[5]);
      }
    }

    this.rgbaColor = { r: r, g: g, b: b, a: a };
    // console.log(this.rgbaColor);
  }

  onChangeComplete($event: any): void {
    // console.log($event.color);
    this.rgbaColor = $event.color.rgb;
  }

  save() {
    // console.log('save');
    // console.log(this.rgbaColor);

    let str = `rgba(${this.rgbaColor.r}, ${this.rgbaColor.g}, ${this.rgbaColor.b}, ${this.rgbaColor.a})`;
    // console.log(str);
    this.colorChange.emit({ color: str });
  }

  cancel() {
    // this.colorChange.emit({ color: this.color });
  }

  clear() {
    this.colorChange.emit({ color: undefined });
  }
}
