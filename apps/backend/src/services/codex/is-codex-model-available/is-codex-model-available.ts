import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { CodexModel } from '#common/types/backend/parts/codex/codex-model';
export function isCodexModelAvailable(item: {
  codexModel: CodexModel;
}): boolean {
  let { codexModel } = item;
  if (codexModel.visibility !== 'list') {
    let isAvailable = false;
    return isAvailable;
  }
  let hasTextInput: boolean =
    codexModel.input_modalities?.includes('text') ?? true;
  if (hasTextInput === false) {
    let isAvailable = false;
    return isAvailable;
  }
  let retirementAt = codexModel.upgrade?.retirement_at;
  if (!isDefinedAndNotEmpty(retirementAt)) {
    let isAvailable = true;
    return isAvailable;
  }
  let retirementTs: number = Date.parse(retirementAt);
  let isRetirementTsValid: boolean = Number.isFinite(retirementTs);
  if (isRetirementTsValid === false) {
    let isAvailable = true;
    return isAvailable;
  }
  let nowTs: number = Date.now();
  let isAvailable: boolean = retirementTs > nowTs;
  return isAvailable;
}
