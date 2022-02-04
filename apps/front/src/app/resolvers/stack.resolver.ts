import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MyDialogService } from '../services/my-dialog.service';
import { BranchResolver } from './branch.resolver';
import { MemberResolver } from './member.resolver';
import { ModelsResolver } from './models.resolver';
import { RepoStructResolver } from './repo-struct.resolver';

@Injectable({ providedIn: 'root' })
export class StackResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberResolver: MemberResolver,
    private branchResolver: BranchResolver,
    private repoStructResolver: RepoStructResolver,
    private modelsResolver: ModelsResolver,
    private myDialogService: MyDialogService,
    private router: Router
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let memberResolverPass = await this.memberResolver.resolve().toPromise();

    if (memberResolverPass === false) {
      return false;
    }

    let branchResolverPass = await this.branchResolver
      .resolve(route)
      .toPromise();

    if (branchResolverPass === false) {
      return false;
    }

    let repoStructResolverPass = await this.repoStructResolver
      .resolve(route)
      .toPromise();

    if (repoStructResolverPass === false) {
      return false;
    }

    let modelsResolverPass = await this.modelsResolver.resolve().toPromise();

    if (modelsResolverPass === false) {
      return false;
    }

    return true;
  }
}
