import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as components from 'src/app/components/_index';
import { MyCovalentModule } from 'src/app/modules/my-covalent.module';
import { MyMaterialModule } from 'src/app/modules/my-material.module';
import { SharedModule } from 'src/app/modules/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    MyCovalentModule,
    FlexLayoutModule,
    RouterModule,
    NgxChartsModule
  ],
  declarations: [
    components.VisualComponent,
  ],
  entryComponents: [

  ],
  exports: [
    components.VisualComponent
  ]
})

export class VisualModule {
}
