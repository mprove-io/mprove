import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TippyDirective } from '@ngneat/helipopper';
import { UiSwitchModule } from 'ngx-ui-switch';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';
import { getLlmModelVariantsError } from '#front/app/functions/get-llm-model-variants-error';
import { SharedModule } from '#front/app/modules/shared/shared.module';

@Component({
  selector: 'm-llm-model-variants',
  templateUrl: './llm-model-variants.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiSwitchModule,
    SharedModule,
    TippyDirective
  ]
})
export class LlmModelVariantsComponent {
  @Input() variants: LlmModelVariant[] = [];
  @Input() isExplorer = false;
  @Input() isBuilder = false;
  @Input() allowManualVariants = false;
  @Output() variantsChange = new EventEmitter<LlmModelVariant[]>();

  draftVariantStartIndex?: number;
  addVariantError?: string;

  get variantsError(): string | undefined {
    let error: string | undefined = getLlmModelVariantsError({
      variants: this.variants,
      isExplorer: this.isExplorer,
      isBuilder: this.isBuilder
    });

    return error;
  }

  displayName(item: { variant: LlmModelVariant }): string {
    let { variant } = item;

    return variant.variant === LLM_MODEL_DEFAULT_VARIANT
      ? 'default (not specified)'
      : variant.variant;
  }

  toggleEnabled(item: {
    row: LlmModelVariant;
    destination: 'Explorer' | 'Builder';
  }) {
    let { row, destination } = item;

    let variants: LlmModelVariant[] = this.variants.map(variant => {
      if (variant !== row) {
        return variant;
      }

      if (destination === 'Explorer') {
        let isExplorer: boolean = variant.isExplorer === false;

        return {
          variant: variant.variant,
          isExplorer: isExplorer,
          isExplorerRecommended: variant.isExplorerRecommended,
          isBuilder: variant.isBuilder,
          isBuilderRecommended: variant.isBuilderRecommended
        };
      }

      let isBuilder: boolean = variant.isBuilder === false;

      return {
        variant: variant.variant,
        isExplorer: variant.isExplorer,
        isExplorerRecommended: variant.isExplorerRecommended,
        isBuilder: isBuilder,
        isBuilderRecommended: variant.isBuilderRecommended
      };
    });

    this.variantsChange.emit(variants);
  }

  selectRecommended(item: {
    row: LlmModelVariant;
    destination: 'Explorer' | 'Builder';
  }) {
    let { row, destination } = item;

    let variants: LlmModelVariant[] = this.variants.map(variant => ({
      variant: variant.variant,
      isExplorer: variant.isExplorer,
      isExplorerRecommended:
        destination === 'Explorer' && variant === row
          ? variant.isExplorerRecommended === false
          : variant.isExplorerRecommended,
      isBuilder: variant.isBuilder,
      isBuilderRecommended:
        destination === 'Builder' && variant === row
          ? variant.isBuilderRecommended === false
          : variant.isBuilderRecommended
    }));

    this.variantsChange.emit(variants);
  }

  startAddVariant() {
    let variant: LlmModelVariant = {
      variant: '',
      isExplorer: false,
      isExplorerRecommended: false,
      isBuilder: false,
      isBuilderRecommended: false
    };

    if (this.draftVariantStartIndex === undefined) {
      this.draftVariantStartIndex = this.variants.length;
    }

    this.addVariantError = undefined;
    this.variantsChange.emit([...this.variants, variant]);
  }

  updateDraftVariantName(item: { row: LlmModelVariant; name: string }) {
    let { row, name } = item;

    row.variant = name;
    this.addVariantError = undefined;
    this.variantsChange.emit([...this.variants]);
  }

  validateDraftVariant(item: { row: LlmModelVariant }) {
    let { row } = item;
    let name: string = row.variant.trim();
    let normalizedName: string = name.toLocaleLowerCase();

    if (name.length === 0) {
      this.addVariantError = 'Variant name is required.';

      return;
    }

    if (normalizedName === LLM_MODEL_DEFAULT_VARIANT) {
      this.addVariantError = 'default is reserved.';

      return;
    }

    let isDuplicate: boolean = this.variants.some(
      variant =>
        variant !== row &&
        variant.variant.trim().toLocaleLowerCase() === normalizedName
    );

    if (isDuplicate) {
      this.addVariantError = 'Variant name must be unique.';

      return;
    }

    row.variant = name;
    this.addVariantError = undefined;
    this.variantsChange.emit([...this.variants]);
  }

  removeVariant(item: { row: LlmModelVariant; index: number }) {
    let { row, index } = item;

    if (row.variant === LLM_MODEL_DEFAULT_VARIANT) {
      return;
    }

    let variants: LlmModelVariant[] = this.variants.filter(
      (_variant, variantIndex) => variantIndex !== index
    );

    if (
      this.draftVariantStartIndex !== undefined &&
      index < this.draftVariantStartIndex
    ) {
      this.draftVariantStartIndex = this.draftVariantStartIndex - 1;
    }

    if (
      this.draftVariantStartIndex !== undefined &&
      variants.length === this.draftVariantStartIndex
    ) {
      this.draftVariantStartIndex = undefined;
      this.addVariantError = undefined;
    }

    this.variantsChange.emit(variants);
  }
}
