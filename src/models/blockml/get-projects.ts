import { constantAxiosInstance } from './_constant-axios-instance';

export function getProjects() { // TODO: get projects not implemented
  return constantAxiosInstance.post('getProjects');
}
