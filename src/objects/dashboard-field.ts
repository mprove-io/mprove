import * as api from '../_index';

export interface DashboardField {
    id: string;
    hidden: boolean;
    label: string;
    result: api.DashboardFieldResultEnum;
    fractions: api.Fraction[];
    description?: string;
    from_field?: string;
}
