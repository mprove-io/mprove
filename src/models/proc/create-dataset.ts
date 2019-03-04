import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

const { BigQuery } = require('@google-cloud/bigquery');

export async function createDataset(item: {
  bigquery_project: string;
  project_id: string;
  credentials_file_path: string;
}) {
  let bigquery;

  bigquery = new BigQuery({
    projectId: item.bigquery_project,
    keyFilename: item.credentials_file_path
  });

  let datasetName = `mprove_${item.project_id}`;

  let bigqueryDataset = bigquery.dataset(datasetName);

  let datasetExistsItem = await bigqueryDataset
    .exists()
    .catch((e: any) =>
      helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_DATASET_EXISTS_CHECK)
    );

  if (datasetExistsItem[0] === false) {
    await bigqueryDataset
      .create()
      .catch((e: any) =>
        helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_DATASET_CREATE)
      );
  }
}
