import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import * as components from '@app/components/_index';
import { MenuModule } from '@app/modules/menu.module';
import { MyMaterialModule } from '@app/modules/my-material.module';
import { ProfileModule } from '@app/modules/profile.module';
import { ProjectModule } from '@app/modules/project.module';
import { SharedModule } from '@app/modules/shared.module';
import { ValidationMsgModule } from '@app/modules/validation-msg.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    FlexLayoutModule,
    MenuModule,
    ProfileModule,
    ProjectModule,
    RouterModule,
    ValidationMsgModule,
    ReactiveFormsModule
  ],
  declarations: [
    components.SpaceComponent,
    components.LoginComponent,
    components.LogoutComponent,
    components.NavBlockmlComponent,
    components.NavDashboardsComponent,
    components.NavDevProdComponent,
    components.NavModelsComponent,
    components.NavRemoteErrorsComponent,
    components.NotFound404Component,
    components.ProjectDeletedComponent,
    components.RegisterComponent,
    components.VerifyEmailSentComponent,
    components.ConfirmEmailComponent,
    components.ResetPasswordSentComponent,
    components.UpdatePasswordComponent
  ],
  exports: [components.SpaceComponent]
})
export class SpaceModule {}
