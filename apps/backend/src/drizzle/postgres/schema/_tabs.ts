import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { ProviderOptionsAnthropic } from '#common/zod/backend/provider-options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/zod/backend/provider-options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/zod/backend/provider-options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/zod/backend/provider-options/provider-options-openai-compatible';
import type {
  AvatarLt,
  AvatarSt,
  BranchLt,
  BranchSt,
  BridgeLt,
  BridgeSt,
  CachedColumnLt,
  CachedColumnSt,
  CachedPartLt,
  CachedPartSt,
  ChartLt,
  ChartSt,
  ConnectionLt,
  ConnectionSt,
  DashboardLt,
  DashboardSt,
  DconfigLt,
  DconfigSt,
  EnvLt,
  EnvSt,
  GivenLt,
  GivenSt,
  KitLt,
  KitSt,
  MconfigLt,
  MconfigSt,
  MemberLt,
  MemberSt,
  ModelLt,
  ModelSt,
  NoteLt,
  NoteSt,
  OcEventLt,
  OcEventSt,
  OcMessageLt,
  OcMessageSt,
  OcPartLt,
  OcPartSt,
  OcSessionLt,
  OcSessionSt,
  OrgLt,
  OrgSt,
  ProjectLt,
  ProjectSt,
  ProviderLt,
  QueryLt,
  QuerySt,
  ReportLt,
  ReportSt,
  RoleLt,
  RoleSt,
  SessionLt,
  SessionSt,
  StructLt,
  StructSt,
  UconfigLt,
  UconfigSt,
  UserLt,
  UserSt
} from '#common/zod/st-lt';
import { AvatarEnt } from './avatars';
import { BranchEnt } from './branches';
import { BridgeEnt } from './bridges';
import { CachedColumnsEnt } from './cached-columns';
import { CachedPartsEnt } from './cached-parts';
import { ChartEnt } from './charts';
import { ConnectionEnt } from './connections';
import { DashboardEnt } from './dashboards';
import { DconfigEnt } from './dconfigs';
import { EnvEnt } from './envs';
import { GivenEnt } from './givens';
import { KitEnt } from './kits';
import { MconfigEnt } from './mconfigs';
import { MemberEnt } from './members';
import { ModelFieldLeafEnt } from './model-field-leafs';
import { ModelEnt } from './models';
import { NoteEnt } from './notes';
import { OcEventEnt } from './oc-events';
import { OcMessageEnt } from './oc-messages';
import { OcPartEnt } from './oc-parts';
import { OcSessionEnt } from './oc-sessions';
import { OrgEnt } from './orgs';
import { ProjectEnt } from './projects';
import type { ProviderEnt } from './providers';
import { QueryEnt } from './queries';
import { ReportEnt } from './reports';
import { RoleEnt } from './roles';
import { SessionEnt } from './sessions';
import { StructEnt } from './structs';
import { UconfigEnt } from './uconfigs';
import { UserEnt } from './users';

export interface AvatarTab
  extends Omit<AvatarEnt, 'st' | 'lt'>,
    AvatarSt,
    AvatarLt {}

export interface BranchTab
  extends Omit<BranchEnt, 'st' | 'lt'>,
    BranchSt,
    BranchLt {}

export interface BridgeTab
  extends Omit<BridgeEnt, 'st' | 'lt'>,
    BridgeSt,
    BridgeLt {}

export interface CachedColumnTab
  extends Omit<CachedColumnsEnt, 'st' | 'lt'>,
    CachedColumnSt,
    CachedColumnLt {}

export interface CachedPartTab
  extends Omit<CachedPartsEnt, 'st' | 'lt'>,
    CachedPartSt,
    CachedPartLt {}

export interface ChartTab
  extends Omit<ChartEnt, 'st' | 'lt'>,
    ChartSt,
    ChartLt {}

export interface ConnectionTab
  extends Omit<ConnectionEnt, 'st' | 'lt'>,
    ConnectionSt,
    ConnectionLt {}

export interface DashboardTab
  extends Omit<DashboardEnt, 'st' | 'lt'>,
    DashboardSt,
    DashboardLt {}

export interface EnvTab extends Omit<EnvEnt, 'st' | 'lt'>, EnvSt, EnvLt {}

export interface GivenTab
  extends Omit<GivenEnt, 'st' | 'lt'>,
    GivenSt,
    GivenLt {}

export interface DconfigTab
  extends Omit<DconfigEnt, 'st' | 'lt'>,
    DconfigSt,
    DconfigLt {}

export interface KitTab extends Omit<KitEnt, 'st' | 'lt'>, KitSt, KitLt {}

export interface MconfigTab
  extends Omit<MconfigEnt, 'st' | 'lt'>,
    MconfigSt,
    MconfigLt {}

export interface MemberTab
  extends Omit<MemberEnt, 'st' | 'lt'>,
    MemberSt,
    MemberLt {}

export interface ModelTab
  extends Omit<ModelEnt, 'st' | 'lt'>,
    ModelSt,
    ModelLt {}

export interface ModelFieldLeafTab
  extends Omit<ModelFieldLeafEnt, 'modelFieldLeafFullId'> {}

export interface NoteTab extends Omit<NoteEnt, 'st' | 'lt'>, NoteSt, NoteLt {}

export interface OrgTab extends Omit<OrgEnt, 'st' | 'lt'>, OrgSt, OrgLt {}

export interface ProjectTab
  extends Omit<ProjectEnt, 'st' | 'lt'>,
    ProjectSt,
    ProjectLt {}

type ProviderTabBase = Omit<ProviderEnt, 'st' | 'lt' | 'type' | 'models'> &
  ProviderLt & {
    name: string;
    models: LlmModel[];
  };

export type ProviderTab = ProviderTabBase &
  (
    | {
        type: ProviderTypeEnum.OpenAI;
        options: ProviderOptionsOpenAI;
      }
    | {
        type: ProviderTypeEnum.Anthropic;
        options: ProviderOptionsAnthropic;
      }
    | {
        type: ProviderTypeEnum.OpenAICompatible;
        options: ProviderOptionsOpenAICompatible;
      }
    | {
        type: ProviderTypeEnum.OpenAICodex;
        options: ProviderOptionsCodex;
      }
  );

export interface QueryTab
  extends Omit<QueryEnt, 'st' | 'lt'>,
    QuerySt,
    QueryLt {}

export interface ReportTab
  extends Omit<ReportEnt, 'st' | 'lt'>,
    ReportSt,
    ReportLt {}

export interface RoleTab extends Omit<RoleEnt, 'st' | 'lt'>, RoleSt, RoleLt {}

export interface StructTab
  extends Omit<StructEnt, 'st' | 'lt'>,
    StructSt,
    StructLt {}

export interface UserTab extends Omit<UserEnt, 'st' | 'lt'>, UserSt, UserLt {}

export interface OcEventTab
  extends Omit<OcEventEnt, 'st' | 'lt'>,
    OcEventSt,
    OcEventLt {}

export interface OcMessageTab
  extends Omit<OcMessageEnt, 'st' | 'lt'>,
    OcMessageSt,
    OcMessageLt {}

export interface OcPartTab
  extends Omit<OcPartEnt, 'st' | 'lt'>,
    OcPartSt,
    OcPartLt {}

export interface OcSessionTab
  extends Omit<OcSessionEnt, 'st' | 'lt'>,
    OcSessionSt,
    OcSessionLt {}

export interface SessionTab
  extends Omit<SessionEnt, 'st' | 'lt'>,
    SessionSt,
    SessionLt {}

export interface UconfigTab
  extends Omit<UconfigEnt, 'st' | 'lt'>,
    UconfigSt,
    UconfigLt {}
