import {
  AvatarLt,
  AvatarSt,
  BranchLt,
  BranchSt,
  BridgeLt,
  BridgeSt,
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
  OrgLt,
  OrgSt,
  ProjectLt,
  ProjectSt,
  QueryLt,
  QuerySt,
  ReportLt,
  ReportSt,
  StructLt,
  StructSt,
  UserLt,
  UserSt
} from '#common/interfaces/st-lt';
import { AvatarEnt } from './avatars';
import { BranchEnt } from './branches';
import { BridgeEnt } from './bridges';
import { ChartEnt } from './charts';
import { ConnectionEnt } from './connections';
import { DashboardEnt } from './dashboards';
import { DconfigEnt } from './dconfigs';
import { EnvEnt } from './envs';
import { KitEnt } from './kits';
import { MconfigEnt } from './mconfigs';
import { MemberEnt } from './members';
import { ModelEnt } from './models';
import { NoteEnt } from './notes';
import { OrgEnt } from './orgs';
import { ProjectEnt } from './projects';
import { QueryEnt } from './queries';
import { ReportEnt } from './reports';
import { StructEnt } from './structs';
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

export interface NoteTab extends Omit<NoteEnt, 'st' | 'lt'>, NoteSt, NoteLt {}

export interface OrgTab extends Omit<OrgEnt, 'st' | 'lt'>, OrgSt, OrgLt {}

export interface ProjectTab
  extends Omit<ProjectEnt, 'st' | 'lt'>,
    ProjectSt,
    ProjectLt {}

export interface QueryTab
  extends Omit<QueryEnt, 'st' | 'lt'>,
    QuerySt,
    QueryLt {}

export interface ReportTab
  extends Omit<ReportEnt, 'st' | 'lt'>,
    ReportSt,
    ReportLt {}

export interface StructTab
  extends Omit<StructEnt, 'st' | 'lt'>,
    StructSt,
    StructLt {}

export interface UserTab extends Omit<UserEnt, 'st' | 'lt'>, UserSt, UserLt {}
