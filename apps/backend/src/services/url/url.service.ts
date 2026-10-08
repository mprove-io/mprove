import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import { checkApiHostname } from '#backend/services/url/check-api-hostname/check-api-hostname';
import { ServerError } from '#common/classes/server-error/server-error';

import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { CheckApiUrlResultError } from '#common/types/backend/function-errors/check-api-url-result-error';

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
        message: 'BACKEND_API_INVALID_URL',
        displayData: { url: urlStr },
        originalError: e
      });
    }

    if (protocol !== 'https:' && protocol !== 'http:') {
      throw new ServerError({
        message: 'BACKEND_API_PROTOCOL_MUST_BE_HTTPS_OR_HTTP',
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
        message: 'BACKEND_API_HOST_IS_BLOCKED_BY_LIST',
        displayData: { url: urlStr }
      });
    }

    if (this.allowHostsLowerCase.indexOf(hostnameLowerCase) < 0) {
      await checkApiHostname({ hostname: hostnameLowerCase });
    }
  }

  async checkApiUrlResult(item: {
    urlStr: string;
  }): Result.ResultAsync<void, CheckApiUrlResultError> {
    try {
      await this.checkApiUrl(item);

      return Result.succeed();
    } catch (error) {
      if (error instanceof ServerError) {
        switch (error.message) {
          case 'BACKEND_API_INVALID_URL':
          case 'BACKEND_API_PROTOCOL_MUST_BE_HTTPS_OR_HTTP':
          case 'BACKEND_API_HOST_IS_BLOCKED_BY_LIST':
          case 'BACKEND_API_HOST_IS_BLOCKED_BY_SPEC':
          case 'BACKEND_API_HOST_IS_BLOCKED_BY_SUFFIX':
          case 'BACKEND_API_HOST_IS_BLOCKED_BY_IP':
          case 'BACKEND_API_HOST_DNS_LOOKUP_FAILED':
            return Result.fail({
              code: error.message,
              displayData: error.displayData
            });
        }
      }

      throw error;
    }
  }
}
