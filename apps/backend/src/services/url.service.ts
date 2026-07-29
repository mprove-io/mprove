import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { ErEnum } from '#common/enums/er.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { ServerError } from '#common/models/server-error';
import { checkApiHostname } from '#node-common/functions/check-api-hostname';

@Injectable()
export class UrlService {
  private blockHostsLowerCase: string[] = [];
  private allowHostsLowerCase: string[] = [];

  constructor(private cs: ConfigService<BackendConfig>) {
    let blockHosts =
      this.cs.get<BackendConfig['apiBlockHosts']>('apiBlockHosts');

    if (isDefinedAndNotEmpty(blockHosts)) {
      this.blockHostsLowerCase = blockHosts
        .split(',')
        .map(x => x.trim())
        .map(x => x.toLowerCase());
    }

    let allowHosts =
      this.cs.get<BackendConfig['apiAllowHosts']>('apiAllowHosts');

    if (isDefinedAndNotEmpty(allowHosts)) {
      this.allowHostsLowerCase = allowHosts
        .split(',')
        .map(x => x.trim())
        .map(x => x.toLowerCase());
    }
  }

  async checkApiUrl(item: { urlStr: string }) {
    let { urlStr } = item;

    let protocol: string;
    let hostnameLowerCase: string;

    try {
      let parsedUrl = new URL(urlStr);
      protocol = parsedUrl.protocol;
      hostnameLowerCase = parsedUrl.hostname.toLowerCase();
    } catch (e) {
      throw new ServerError({
        message: ErEnum.BACKEND_API_INVALID_URL,
        displayData: { url: urlStr },
        originalError: e
      });
    }

    if (protocol !== 'https:') {
      throw new ServerError({
        message: ErEnum.BACKEND_API_PROTOCOL_MUST_BE_HTTPS,
        displayData: { url: urlStr }
      });
    }

    if (
      this.blockHostsLowerCase.some(
        x =>
          hostnameLowerCase === x ||
          hostnameLowerCase.endsWith('.' + x) === true
      )
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_API_HOST_IS_BLOCKED_BY_LIST,
        displayData: { url: urlStr }
      });
    }

    if (this.allowHostsLowerCase.indexOf(hostnameLowerCase) < 0) {
      await checkApiHostname({ hostname: hostnameLowerCase });
    }
  }
}
