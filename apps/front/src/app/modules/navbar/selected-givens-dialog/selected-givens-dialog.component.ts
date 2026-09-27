import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';
import type { MemberGiven } from '#common/zod/backend/members/member-given';
import type { ProjectSelectedGivenLink } from '#common/zod/backend/project-selected-given-link';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { UiQuery } from '#front/app/queries/ui.query';
import { UiService } from '#front/app/services/ui.service';

export interface SelectedGivensDialogData {
  projectId: string;
  userId: string;
  memberGivens: MemberGiven[];
}

@Component({
  selector: 'm-selected-givens-dialog',
  templateUrl: './selected-givens-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, NgScrollbarModule]
})
export class SelectedGivensDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  memberGivens: MemberGiven[] = [];
  selectedGivens: SelectedGiven[] = [];

  constructor(
    public ref: DialogRef<SelectedGivensDialogData>,
    private uiQuery: UiQuery,
    private uiService: UiService
  ) {}

  ngOnInit() {
    let projectSelectedGivenLinks =
      this.uiQuery.getValue().projectSelectedGivenLinks ?? [];

    let projectSelection = projectSelectedGivenLinks.find(
      item => item.projectId === this.ref.data.projectId
    );

    this.selectedGivens = projectSelection?.givens ?? [];
    this.memberGivens = this.ref.data.memberGivens;

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  getSortedValues(item: { given: MemberGiven }) {
    let { given } = item;

    return given.memberGivenValues
      .map(memberGivenValue => memberGivenValue.value)
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
  }

  isValueSelected(item: { givenId: string; value: string }) {
    let { givenId, value } = item;

    let selectedGiven = this.selectedGivens.find(
      given => given.givenId === givenId
    );

    return selectedGiven?.values.indexOf(value) > -1;
  }

  selectSingleValue(item: { givenId: string; value: string }) {
    let { givenId, value } = item;

    let selectedGiven = this.selectedGivens.find(
      given => given.givenId === givenId
    );

    if (selectedGiven?.values[0] === value) {
      return;
    }

    let newSelectedGivens = this.selectedGivens.map(given => {
      if (given.givenId !== givenId) {
        return given;
      }

      let newSelectedGiven: SelectedGiven = {
        givenId: given.givenId,
        type: given.type,
        isMultiple: given.isMultiple,
        values: [value]
      };

      return newSelectedGiven;
    });

    this.selectedGivens = newSelectedGivens;
    this.persistSelectedGivens({ selectedGivens: newSelectedGivens });
  }

  toggleArrayValue(item: { givenId: string; value: string }) {
    let { givenId, value } = item;

    let newSelectedGivens = this.selectedGivens.map(given => {
      if (given.givenId !== givenId) {
        return given;
      }

      let isSelected = given.values.indexOf(value) > -1;
      let values = isSelected
        ? given.values.filter(selectedValue => selectedValue !== value)
        : [...given.values, value].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));

      let newSelectedGiven: SelectedGiven = {
        givenId: given.givenId,
        type: given.type,
        isMultiple: given.isMultiple,
        values: values
      };

      return newSelectedGiven;
    });

    this.selectedGivens = newSelectedGivens;
    this.persistSelectedGivens({ selectedGivens: newSelectedGivens });
  }

  persistSelectedGivens(item: { selectedGivens: SelectedGiven[] }) {
    let { selectedGivens } = item;

    let links = this.uiQuery.getValue().projectSelectedGivenLinks ?? [];

    let newProjectSelection: ProjectSelectedGivenLink = {
      projectId: this.ref.data.projectId,
      givens: selectedGivens,
      navTs: Date.now()
    };

    let newProjectSelectedGivenLinks = [
      newProjectSelection,
      ...links.filter(link => link.projectId !== this.ref.data.projectId)
    ];

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectSelectedGivenLinks = newProjectSelectedGivenLinks.filter(
      link => link.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({
      projectSelectedGivenLinks: newProjectSelectedGivenLinks
    });
    this.uiService.setUserUi({
      projectSelectedGivenLinks: newProjectSelectedGivenLinks
    });
  }

  close() {
    this.ref.close();
  }
}
