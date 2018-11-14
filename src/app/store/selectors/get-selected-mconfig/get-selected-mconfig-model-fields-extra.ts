import { createSelector } from '@ngrx/store';
import { getSelectedMconfigFilters } from 'app/store/selectors/get-selected-mconfig/get-selected-mconfig-filters';
import { getSelectedMconfigSelect } from 'app/store/selectors/get-selected-mconfig/get-selected-mconfig-select';
import { getSelectedProjectModeRepoModel } from 'app/store/selectors/get-selected-project-mode-repo-model/get-selected-project-mode-repo-model';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';

export const getSelectedMconfigModelFieldsExtra = createSelector(
  getSelectedProjectModeRepoModel,
  getSelectedMconfigSelect,
  getSelectedMconfigFilters,
  (model: api.Model, select: string[], filters: api.Filter[]) => {
    let newFields: interfaces.ModelFieldExtra[] = [];

    if (model) {
      newFields = model.fields.map((field: api.ModelField) =>
        Object.assign({}, field, {
          is_selected: select
            ? select.findIndex(fieldId => field.id === fieldId) > -1
            : false,
          is_filtered: filters
            ? filters.findIndex(filter => field.id === filter.field_id) > -1
            : false
        })
      );
    }

    return newFields.length > 0 ? newFields : undefined;
  }
);
