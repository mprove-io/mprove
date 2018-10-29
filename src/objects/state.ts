import * as api from '../_index';

export interface State {
    user: api.User;
    projects: Array<api.Project>;
    subscriptions: Array<api.Subscription>;
    payments: Array<api.Payment>;
    members: Array<api.Member>;
    files: Array<api.CatalogFile>;
    structs: Array<api.Struct>;

}