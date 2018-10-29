import * as api from '../_index';

export interface State {
    user: api.User;
    projects: api.Project[];
    subscriptions: api.Subscription[];
    payments: api.Payment[];
    members: api.Member[];
    files: api.CatalogFile[];
    structs: api.Struct[];
}
