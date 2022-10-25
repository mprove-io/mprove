import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BranchResolver } from './branch.resolver';
import { MemberResolver } from './member.resolver';
import { RepoResolver } from './repo.resolver';
import { StructResolver } from './struct.resolver';

@Injectable({ providedIn: 'root' })
export class StackResolver implements Resolve<Promise<boolean>> {
  constructor(
    private memberResolver: MemberResolver,
    private repoResolver: RepoResolver,
    private branchResolver: BranchResolver,
    private structResolver: StructResolver
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

    let structResolverPass = await this.structResolver
      .resolve(route)
      .toPromise();

    if (structResolverPass === false) {
      return false;
    }

    return true;
  }
}
