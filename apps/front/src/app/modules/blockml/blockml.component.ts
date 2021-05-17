import { Component } from '@angular/core';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';

@Component({
  selector: 'm-blockml',
  templateUrl: './blockml.component.html'
})
export class BlockmlComponent {
  constructor(
    public projectQuery: ProjectQuery,
    public memberQuery: MemberQuery,
    public navQuery: NavQuery
  ) {}
}
