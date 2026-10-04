import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { ProviderOptionsAnthropic } from '#common/types/backend/parts/provider/options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/types/backend/parts/provider/options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/types/backend/parts/provider/options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/types/backend/parts/provider/options/provider-options-openai-compatible';
import type { AvatarLt } from '#common/types/shared/st-lt/avatars/avatar-lt';
import type { AvatarSt } from '#common/types/shared/st-lt/avatars/avatar-st';
import type { BranchLt } from '#common/types/shared/st-lt/branches/branch-lt';
import type { BranchSt } from '#common/types/shared/st-lt/branches/branch-st';
import type { BridgeLt } from '#common/types/shared/st-lt/bridges/bridge-lt';
import type { BridgeSt } from '#common/types/shared/st-lt/bridges/bridge-st';
import type { CachedColumnLt } from '#common/types/shared/st-lt/cached-columns/cached-column-lt';
import type { CachedColumnSt } from '#common/types/shared/st-lt/cached-columns/cached-column-st';
import type { CachedPartLt } from '#common/types/shared/st-lt/cached-parts/cached-part-lt';
import type { CachedPartSt } from '#common/types/shared/st-lt/cached-parts/cached-part-st';
import type { ChartLt } from '#common/types/shared/st-lt/charts/chart-lt';
import type { ChartSt } from '#common/types/shared/st-lt/charts/chart-st';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';
import type { DashboardLt } from '#common/types/shared/st-lt/dashboards/dashboard-lt';
import type { DashboardSt } from '#common/types/shared/st-lt/dashboards/dashboard-st';
import type { DconfigLt } from '#common/types/shared/st-lt/dconfigs/dconfig-lt';
import type { DconfigSt } from '#common/types/shared/st-lt/dconfigs/dconfig-st';
import type { EnvLt } from '#common/types/shared/st-lt/envs/env-lt';
import type { EnvSt } from '#common/types/shared/st-lt/envs/env-st';
import type { GivenLt } from '#common/types/shared/st-lt/givens/given-lt';
import type { GivenSt } from '#common/types/shared/st-lt/givens/given-st';
import type { KitLt } from '#common/types/shared/st-lt/kits/kit-lt';
import type { KitSt } from '#common/types/shared/st-lt/kits/kit-st';
import type { MconfigLt } from '#common/types/shared/st-lt/mconfigs/mconfig-lt';
import type { MconfigSt } from '#common/types/shared/st-lt/mconfigs/mconfig-st';
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';
import type { ModelLt } from '#common/types/shared/st-lt/models/model-lt';
import type { ModelSt } from '#common/types/shared/st-lt/models/model-st';
import type { NoteLt } from '#common/types/shared/st-lt/notes/note-lt';
import type { NoteSt } from '#common/types/shared/st-lt/notes/note-st';
import type { OcEventLt } from '#common/types/shared/st-lt/oc-events/oc-event-lt';
import type { OcEventSt } from '#common/types/shared/st-lt/oc-events/oc-event-st';
import type { OcMessageLt } from '#common/types/shared/st-lt/oc-messages/oc-message-lt';
import type { OcMessageSt } from '#common/types/shared/st-lt/oc-messages/oc-message-st';
import type { OcPartLt } from '#common/types/shared/st-lt/oc-parts/oc-part-lt';
import type { OcPartSt } from '#common/types/shared/st-lt/oc-parts/oc-part-st';
import type { OcSessionLt } from '#common/types/shared/st-lt/oc-sessions/oc-session-lt';
import type { OcSessionSt } from '#common/types/shared/st-lt/oc-sessions/oc-session-st';
import type { OrgLt } from '#common/types/shared/st-lt/orgs/org-lt';
import type { OrgSt } from '#common/types/shared/st-lt/orgs/org-st';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';
import type { ProviderLt } from '#common/types/shared/st-lt/providers/provider-lt';
import type { QueryLt } from '#common/types/shared/st-lt/queries/query-lt';
import type { QuerySt } from '#common/types/shared/st-lt/queries/query-st';
import type { ReportLt } from '#common/types/shared/st-lt/reports/report-lt';
import type { ReportSt } from '#common/types/shared/st-lt/reports/report-st';
import type { RoleLt } from '#common/types/shared/st-lt/roles/role-lt';
import type { RoleSt } from '#common/types/shared/st-lt/roles/role-st';
import type { SessionLt } from '#common/types/shared/st-lt/sessions/session-lt';
import type { SessionSt } from '#common/types/shared/st-lt/sessions/session-st';
import type { StructLt } from '#common/types/shared/st-lt/structs/struct-lt';
import type { StructSt } from '#common/types/shared/st-lt/structs/struct-st';
import type { UconfigLt } from '#common/types/shared/st-lt/uconfigs/uconfig-lt';
import type { UconfigSt } from '#common/types/shared/st-lt/uconfigs/uconfig-st';
import type { UserLt } from '#common/types/shared/st-lt/users/user-lt';
import type { UserSt } from '#common/types/shared/st-lt/users/user-st';
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
        type: 'OpenAI';
        options: ProviderOptionsOpenAI;
      }
    | {
        type: 'Anthropic';
        options: ProviderOptionsAnthropic;
      }
    | {
        type: 'OpenAICompatible';
        options: ProviderOptionsOpenAICompatible;
      }
    | {
        type: 'OpenAICodex';
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
