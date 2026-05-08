export type SearchFieldMatch = {
  modelId: string;
  fieldId: string;
  matchedByValues: SearchFieldMatchedByValue[];
  matchedByNames: SearchFieldMatchedByName[];
};

export type SearchModelFieldsToolResult = {
  modelId: string;
  matchedFields: {
    fieldId: string;
    matchedByValues: SearchFieldMatchedByValue[];
    matchedByNames: SearchFieldMatchedByName[];
  }[];
}[];

export type SearchFieldMatchedByValue = {
  searchFieldValue: string;
  matchedValues: { value: string; count: number }[];
};

export type SearchFieldMatchedByName = {
  searchFieldName: string;
  matchedOn: string[];
};
