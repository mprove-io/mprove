import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import { checkApiHostname } from '#backend/services/url/check-api-hostname/check-api-hostname';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { BackendApiInvalidUrlError } from '#common/types/backend/errors/backend-api-invalid-url-error';
import type { CheckApiUrlError } from '#common/types/backend/function-errors/check-api-url-error';
import { wrapError } from '#node-common/functions/wrap-error/wrap-error';

@Injectable()
export class UrlService {
  private blockHostsLowerCase: string[] = [];
  private allowHostsLowerCase: string[] = [];

  constructor(private cs: ConfigService<BackendConfig>) {
    let blockHosts: BackendConfig['apiBlockHosts'] =
      this.cs.get<BackendConfig['apiBlockHosts']>('apiBlockHosts');

    if (isDefinedAndNotEmpty(blockHosts)) {
      this.blockHostsLowerCase = blockHosts
        .split(',')
        .map(x => x.trim())
        .map(x => x.toLowerCase());
    }

    let allowHosts: BackendConfig['apiAllowHosts'] =
      this.cs.get<BackendConfig['apiAllowHosts']>('apiAllowHosts');

    if (isDefinedAndNotEmpty(allowHosts)) {
      this.allowHostsLowerCase = allowHosts
        .split(',')
        .map(x => x.trim())
        .map(x => x.toLowerCase());
    }
  }

  async checkApiUrl(item: {
    urlStr: string;
  }): Result.ResultAsync<void, CheckApiUrlError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'parsedUrl',
        (v): Result.Result<URL, BackendApiInvalidUrlError> =>
          Result.try({
            try: () => new URL(v.urlStr),
            catch: error => ({
              code: 'BACKEND_API_INVALID_URL',
              displayData: { url: v.urlStr },
              customData: isDefined(error)
                ? {
                    originalError:
                      error instanceof Error ? wrapError(error) : error
                  }
                : undefined
            })
          })
      ),
      Result.andThrough(v =>
        v.parsedUrl.protocol !== 'https:' && v.parsedUrl.protocol !== 'http:'
          ? Result.fail({
              code: 'BACKEND_API_PROTOCOL_MUST_BE_HTTPS_OR_HTTP',
              displayData: { url: v.urlStr }
            })
          : Result.succeed()
      ),
      Result.bind(
        'hostnameLowerCase',
        (v): Result.Result<string, never> =>
          Result.succeed(v.parsedUrl.hostname.toLowerCase())
      ),
      Result.andThrough(v =>
        this.blockHostsLowerCase.some(
          hostname =>
            v.hostnameLowerCase === hostname ||
            v.hostnameLowerCase.endsWith('.' + hostname) === true
        )
          ? Result.fail({
              code: 'BACKEND_API_HOST_IS_BLOCKED_BY_LIST',
              displayData: { url: v.urlStr }
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.allowHostsLowerCase.includes(v.hostnameLowerCase)
          ? Result.succeed()
          : checkApiHostname({ hostname: v.hostnameLowerCase })
      ),
      Result.map((v): void => undefined)
    );
  }
}
