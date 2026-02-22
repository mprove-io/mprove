import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import type { Event, Message, Part, Session, Todo } from '@opencode-ai/sdk/v2';
import { ConnectionOptions } from './backend/connection-parts/connection-options';
import { Ev } from './backend/ev';
import { MproveConfig } from './backend/mprove-config';
import { Ui } from './backend/ui';
import { BmlError } from './blockml/bml-error';
import { DashboardField } from './blockml/dashboard-field';
import { Filter } from './blockml/filter';
import { FileStore } from './blockml/internal/file-store';
import { MconfigChart } from './blockml/mconfig-chart';
import { ModelField } from './blockml/model-field';
import { ModelMetric } from './blockml/model-metric';
import { ModelNode } from './blockml/model-node';
import { Preset } from './blockml/preset';
import { ReportField } from './blockml/report-field';
import { Row } from './blockml/row';
import { Sorting } from './blockml/sorting';
import { StorePart } from './blockml/store-part';
import { Tile } from './blockml/tile';
// import { CompiledQuery } from '@malloydata/malloy/dist/model/malloy_types';

export class AvatarSt {
  avatarSmall: string;
}
export class AvatarLt {
  avatarBig: string;
}

//

export class BranchSt {
  emptyData?: number;
}
export class BranchLt {
  emptyData?: number;
}

//

export class BridgeSt {
  emptyData?: number;
}
export class BridgeLt {
  emptyData?: number;
}

//

export class ChartSt {
  title: string;
  modelLabel: string;
  filePath: string;
  tiles: Tile[];
}
export class ChartLt {
  emptyData?: number;
}

//

export class ConnectionSt {
  options: ConnectionOptions;
}
export class ConnectionLt {
  emptyData?: number;
}

//

export class DashboardSt {
  title: string;
  filePath: string;
  accessRoles: string[];
  tiles: Tile[];
  fields: DashboardField[];
}
export class DashboardLt {
  content: any;
}

//

export class EnvSt {
  evs: Ev[];
}
export class EnvLt {
  emptyData?: number;
}

//

export class DconfigSt {
  hashSecret: string;
  hashSecretCheck: string;
}
export class DconfigLt {
  emptyData?: number;
}

//

export class KitSt {
  emptyData?: number;
}
export class KitLt {
  data: any;
}

//

export class MconfigSt {
  emptyData?: number;
}
export class MconfigLt {
  dateRangeIncludesRightSide: boolean;
  storePart: StorePart;
  modelLabel: string;
  modelFilePath: string;
  malloyQueryStable: string;
  malloyQueryExtra: string;
  compiledQuery: any; // CompiledQuery;
  select: string[];
  sortings: Sorting[];
  sorts: string;
  timezone: string;
  limit: number;
  filters: Filter[];
  chart: MconfigChart;
}

//

export class MemberSt {
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
export class MemberLt {
  emptyData?: number;
}

//

export class ModelSt {
  accessRoles: string[];
}
export class ModelLt {
  source: string;
  malloyModelDef: MalloyModelDef;
  filePath: string;
  fileText: string;
  storeContent: FileStore;
  dateRangeIncludesRightSide: boolean;
  label: string;
  fields: ModelField[];
  nodes: ModelNode[];
}

//

export class NoteSt {
  emptyData?: number;
}
export class NoteLt {
  publicKey: string;
  privateKey: string;
  publicKeyEncrypted: string;
  privateKeyEncrypted: string;
  passPhrase: string;
}

//

export class OrgSt {
  name: string;
  ownerEmail: string;
}
export class OrgLt {
  emptyData?: number;
}

//

export class ProjectSt {
  name: string;
  zenApiKey?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  e2bApiKey?: string;
}
export class ProjectLt {
  gitUrl: string;
  defaultBranch: string;
  publicKey: string;
  privateKey: string;
  publicKeyEncrypted: string;
  privateKeyEncrypted: string;
  passPhrase: string;
}

//

export class QuerySt {
  sql: string;
  lastErrorMessage: string;
  apiMethod: string;
  apiUrl: string;
  apiBody: string;
}
export class QueryLt {
  data: any;
}

//

export class ReportSt {
  filePath: string;
  accessRoles: string[];
  title: string;
  fields: ReportField[];
  chart: MconfigChart;
}
export class ReportLt {
  rows: Row[];
}

//

export class StructSt {
  emptyData?: number;
}
export class StructLt {
  errors: BmlError[];
  metrics: ModelMetric[];
  presets: Preset[];
  mproveConfig: MproveConfig;
}

//

export class UserSt {
  emptyData?: number;
}
export class UserLt {
  email: string;
  alias: string;
  passwordHash: string;
  passwordSalt: string;
  firstName: string;
  lastName: string;
  emailVerificationToken: string;
  passwordResetToken: string;
  passwordResetExpiresTs: number;
  ui: Ui;
}

//

export class EventSt {
  ocEvent: Event;
}
export class EventLt {
  emptyData?: number;
}

//

export class SessionSt {
  sandboxId?: string;
  sandboxBaseUrl?: string;
  opencodeSessionId?: string;
  opencodePassword?: string;
  ocSession?: Session;
  firstMessage?: string;
  todos?: Todo[];
}
export class SessionLt {
  emptyData?: number;
}

//

export class MessageSt {
  ocMessage: Message;
}
export class MessageLt {
  emptyData?: number;
}

//

export class PartSt {
  ocPart: Part;
}
export class PartLt {
  emptyData?: number;
}
