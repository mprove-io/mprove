import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { common } from '~front/barrels/common';
import { DeactivateGuard } from './guards/deactivate.guard';
import { RegisterComponent } from './modules/auth/main/01-register/register.component';
import { VerifyEmailComponent } from './modules/auth/main/02-verify-email/verify-email.component';
import { ConfirmEmailComponent } from './modules/auth/main/03-confirm-email/confirm-email.component';
import { EmailConfirmedComponent } from './modules/auth/main/04-email-confirmed/email-confirmed.component';
import { LoginComponent } from './modules/auth/main/05-login/login.component';
import { UserDeletedComponent } from './modules/auth/main/06-user-deleted/user-deleted.component';
import { ForgotPasswordComponent } from './modules/auth/password/01-forgot-password/forgot-password.component';
import { PasswordResetSentComponent } from './modules/auth/password/02-password-reset-sent/password-reset-sent.component';
import { UpdatePasswordComponent } from './modules/auth/password/03-update-password/update-password.component';
import { NewPasswordWasSetComponent } from './modules/auth/password/04-new-password-was-set/new-password-was-set.component';
import { BlockmlEditorComponent } from './modules/blockml/blockml-editor/blockml-editor.component';
import { BlockmlComponent } from './modules/blockml/blockml.component';
import { ModelComponent } from './modules/model/model.component';
import { NavComponent } from './modules/nav/nav.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { OrgAccountComponent } from './modules/org/org-account/org-account.component';
import { OrgUsersComponent } from './modules/org/org-users/org-users.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { ProjectConnectionsComponent } from './modules/project/project-connections/project-connections.component';
import { ProjectSettingsComponent } from './modules/project/project-settings/project-settings.component';
import { ProjectTeamComponent } from './modules/project/project-team/project-team.component';
import { OrgDeletedComponent } from './modules/special/org-deleted/org-deleted.component';
import { OrgOwnerChangedComponent } from './modules/special/org-owner-changed/org-owner-changed.component';
import { ProjectDeletedComponent } from './modules/special/project-deleted/project-deleted.component';
import { BlockmlResolver } from './resolvers/blockml.resolver';
import { BranchResolver } from './resolvers/branch.resolver';
import { ConnectionsResolver } from './resolvers/connections.resolver';
import { FileResolver } from './resolvers/file.resolver';
import { MemberResolver } from './resolvers/member.resolver';
import { ModelResolver } from './resolvers/model.resolver';
import { NavBarResolver } from './resolvers/navbar.resolver';
import { OrgAccountResolver } from './resolvers/org-account.resolver';
import { OrgResolver } from './resolvers/org.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { ProjectSettingsResolver } from './resolvers/project-settings.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { RepoResolver } from './resolvers/repo.resolver';
import { TeamResolver } from './resolvers/team.resolver';
import { UsersResolver } from './resolvers/users.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: common.PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: NavComponent,
    path: '',
    children: [
      {
        component: RegisterComponent,
        path: common.PATH_REGISTER
      },
      {
        component: VerifyEmailComponent,
        path: common.PATH_VERIFY_EMAIL
      },
      {
        component: ConfirmEmailComponent,
        path: common.PATH_CONFIRM_EMAIL
      },
      {
        component: EmailConfirmedComponent,
        path: common.PATH_EMAIL_CONFIRMED
      },
      {
        component: LoginComponent,
        path: common.PATH_LOGIN
      },
      {
        component: ForgotPasswordComponent,
        path: common.PATH_FORGOT_PASSWORD
      },
      {
        component: PasswordResetSentComponent,
        path: common.PATH_PASSWORD_RESET_SENT
      },
      {
        component: UpdatePasswordComponent,
        path: common.PATH_UPDATE_PASSWORD
      },
      {
        component: NewPasswordWasSetComponent,
        path: common.PATH_NEW_PASSWORD_WAS_SET
      },
      {
        component: UserDeletedComponent,
        path: common.PATH_USER_DELETED
      }
    ]
  },
  {
    component: NavbarComponent,
    path: '',
    resolve: [NavBarResolver],
    children: [
      {
        component: PasswordResetSentComponent,
        path: common.PATH_PASSWORD_RESET_SENT_AUTH
      },
      {
        component: ProfileComponent,
        path: common.PATH_PROFILE,
        resolve: [ProfileResolver]
      },
      {
        component: OrgDeletedComponent,
        path: common.PATH_ORG_DELETED
      },
      {
        component: OrgOwnerChangedComponent,
        path: common.PATH_ORG_OWNER_CHANGED
      },
      {
        component: ProjectDeletedComponent,
        path: common.PATH_PROJECT_DELETED
      },
      {
        path: common.PATH_ORG + `/:${common.PARAMETER_ORG_ID}`,
        resolve: [OrgResolver],
        children: [
          {
            component: OrgAccountComponent,
            path: common.PATH_ACCOUNT,
            resolve: [OrgAccountResolver]
          },
          {
            component: OrgUsersComponent,
            path: common.PATH_USERS,
            resolve: [UsersResolver]
          },
          {
            path: common.PATH_PROJECT + `/:${common.PARAMETER_PROJECT_ID}`,
            resolve: [ProjectResolver],
            children: [
              {
                component: ProjectSettingsComponent,
                path: common.PATH_SETTINGS,
                resolve: [MemberResolver, ProjectSettingsResolver]
              },
              {
                component: ProjectConnectionsComponent,
                path: common.PATH_CONNECTIONS,
                resolve: [MemberResolver, ConnectionsResolver]
              },
              {
                component: ProjectTeamComponent,
                path: common.PATH_TEAM,
                resolve: [MemberResolver, TeamResolver]
              },
              {
                path: common.PATH_REPO + `/:${common.PARAMETER_REPO_ID}`,
                resolve: [MemberResolver, RepoResolver],
                children: [
                  {
                    path:
                      common.PATH_BRANCH + `/:${common.PARAMETER_BRANCH_ID}`,
                    resolve: [MemberResolver, BranchResolver],
                    children: [
                      {
                        component: BlockmlComponent,
                        path: common.PATH_BLOCKML,
                        resolve: [BlockmlResolver],
                        children: [
                          {
                            component: BlockmlEditorComponent,
                            canDeactivate: [DeactivateGuard],
                            path:
                              common.PATH_FILE +
                              `/:${common.PARAMETER_FILE_ID}`,
                            resolve: [FileResolver]
                          }
                        ]
                      },
                      {
                        component: ModelComponent,
                        canDeactivate: [
                          // DeactivateGuard
                        ],
                        path:
                          common.PATH_MODEL + `/:${common.PARAMETER_MODEL_ID}`,
                        resolve: [ModelResolver]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
