import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import * as components from '@app/components/_index';
import { BlockMLModule } from '@app/modules/blockml.module';
import { DashboardModule } from '@app/modules/dashboard.module';
import { ModelModule } from '@app/modules/model.module';
import { MyCovalentModule } from '@app/modules/my-covalent.module';
import { MyMaterialModule } from '@app/modules/my-material.module';
import { SharedModule } from '@app/modules/shared.module';
import { ValidationMsgModule } from '@app/modules/validation-msg.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    ClipboardModule,
    MyMaterialModule,
    MyCovalentModule,
    RouterModule,
    ReactiveFormsModule,
    BlockMLModule,
    ModelModule,
    DashboardModule,
    ValidationMsgModule,
    FlexLayoutModule
  ],
  declarations: [
    components.RemoteComponent,
    components.UpdateProjectTimezoneComponent,
    components.UpdateQuerySizeLimitComponent,
    components.UpdateWeekStartComponent,
    components.ProjectComponent,
    components.RepoComponent,
    components.SettingsComponent,
    components.TeamComponent,
    components.PdtsComponent
  ],
  entryComponents: [],
  exports: [components.ProjectComponent]
})
export class ProjectModule {}
