import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BranchResolver } from './branch.resolver';
import { MemberResolver } from './member.resolver';
import { ModelsResolver } from './models.resolver';
import { RepoStructResolver } from './repo-struct.resolver';
import { RepoResolver } from './repo.resolver';

@Injectable({ providedIn: 'root' })
export class StackResolver implements Resolve<Promise<boolean>> {
  constructor(
    private memberResolver: MemberResolver,
    private repoResolver: RepoResolver,
    private branchResolver: BranchResolver,
    private repoStructResolver: RepoStructResolver,
    private modelsResolver: ModelsResolver
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let memberResolverPass = await this.memberResolver.resolve().toPromise();

    if (memberResolverPass === false) {
      return false;
    }

    let repoResolverPass = await this.repoResolver.resolve(route);

    if (repoResolverPass === false) {
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
