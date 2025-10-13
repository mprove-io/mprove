import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class HashService {
  private hashSecret: string;

  constructor() {}

  async createSaltAndHash(item: { input: string }) {
    let { input } = item;

    let salt = await bcrypt.genSalt();
    let hash = await bcrypt.hash(input, salt);

    return { salt, hash };
  }

  async createHashUsingSalt(item: { salt: string; input: string }) {
    let { salt, input } = item;

    return await bcrypt.hash(input, salt);
  }

  createHashSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  setHashSecret(item: { hashSecret: string }) {
    let { hashSecret } = item;
    this.hashSecret = hashSecret;
  }

  makeHash(item: { input: string }) {
    let { input } = item;

    if (isUndefined(this.hashSecret)) {
      throw new ServerError({
        message: ErEnum.BACKEND_HASH_SERVICE_SECRET_IS_NOT_DEFINED
      });
    }

    let hash = crypto
      .createHmac('sha256', this.hashSecret)
      .update(input)
      .digest('hex');

    return hash;
  }

  makeBranchFullId(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }) {
    let { projectId, repoId, branchId } = item;

    let text = projectId + repoId + branchId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeBridgeFullId(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }) {
    let { projectId, repoId, branchId, envId } = item;

    let text = projectId + repoId + branchId + envId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeConnectionFullId(item: {
    projectId: string;
    envId: string;
    connectionId: string;
  }) {
    let { projectId, envId, connectionId } = item;

    let text = projectId + envId + connectionId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeDashboardFullId(item: { structId: string; dashboardId: string }) {
    let { structId, dashboardId } = item;

    let text = structId + dashboardId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeEnvFullId(item: { projectId: string; envId: string }) {
    let { projectId, envId } = item;

    let text = projectId + envId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeEvFullId(item: { projectId: string; envId: string; evId: string }) {
    let { projectId, envId, evId } = item;

    let text = projectId + envId + evId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeMemberFullId(item: { projectId: string; memberId: string }) {
    let { projectId, memberId } = item;

    let text = projectId + memberId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeMetricFullId(item: { structId: string; metricId: string }) {
    let { structId, metricId } = item;

    let text = structId + metricId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeModelFullId(item: { structId: string; modelId: string }) {
    let { structId, modelId } = item;

    let text = structId + modelId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeReportFullId(item: { structId: string; reportId: string }) {
    let { structId, reportId } = item;

    let text = structId + reportId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }

  makeChartFullId(item: { structId: string; chartId: string }) {
    let { structId, chartId } = item;

    let text = structId + chartId;
    let hash = crypto.createHash('sha256').update(text).digest('hex');
    return hash;
  }
}
