import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ColorpickerSliderDirective,
  ColorUtil,
  MColorpicker,
  TextDirective
} from '@app/modules/colorpicker';

@NgModule({
  imports: [CommonModule, FormsModule, OverlayModule, PortalModule, A11yModule],
  exports: [MColorpicker, ColorpickerSliderDirective, TextDirective],
  declarations: [MColorpicker, ColorpickerSliderDirective, TextDirective],
  providers: [ColorUtil]
})
export class ColorPickerModule {}
