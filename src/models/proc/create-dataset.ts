import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

// tslint:disable-next-line:variable-name
const BigQuery = require('@google-cloud/bigquery');

export async function createDataset(item: {
  project_id: string;
  credentials_file_path: string;
}) {
  let bigquery = new BigQuery({
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
