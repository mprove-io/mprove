import type { TabService } from '#backend/services/tab/tab.service';

export type GetEntPropsOutput<DataSt, DataLt> = {
  st: { encrypted: string; decrypted: DataSt };
  lt: { encrypted: string; decrypted: DataLt };
  keyTag: string;
};

export function getEntProps<DataSt, DataLt>(item: {
  dataSt: DataSt;
  dataLt: DataLt;
  isMetadata: boolean;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): GetEntPropsOutput<DataSt, DataLt> {
  let {
    dataSt,
    dataLt,
    isMetadata,
    tabService,
    isEncryptDb,
    isEncryptMetadata
  } = item;

  let isEncrypt =
    isMetadata === true
      ? isEncryptDb === true && isEncryptMetadata === true
      : isEncryptDb === true;

  let output: GetEntPropsOutput<DataSt, DataLt> =
    isEncrypt === true
      ? {
          st: {
            encrypted: tabService.encrypt({ data: dataSt }),
            decrypted: undefined as DataSt
          },
          lt: {
            encrypted: tabService.encrypt({ data: dataLt }),
            decrypted: undefined as DataLt
          },
          keyTag: tabService.keyTag
        }
      : {
          st: {
            encrypted: undefined as string,
            decrypted: dataSt
          },
          lt: {
            encrypted: undefined as string,
            decrypted: dataLt
          },
          keyTag: undefined
        };

  return output;
}
