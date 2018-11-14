import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import * as components from 'app/components/_index';

@NgModule({
  imports: [CommonModule],
  declarations: [components.ValidationMsgComponent],
  exports: [components.ValidationMsgComponent]
})
export class ValidationMsgModule {}
