import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

export interface SetUserThemesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    main_theme: apiEnums.UserMainThemeEnum;
    dash_theme: apiEnums.UserDashThemeEnum;
    file_theme: apiEnums.UserFileThemeEnum;
    sql_theme: apiEnums.UserSqlThemeEnum;  
    server_ts: number;
  };
}


export interface SetUserThemesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    user: apiObjects.User;
  };
}
