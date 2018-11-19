import { constantAxiosInstance } from './_constant-axios-instance';

export function getProjects() {
  return constantAxiosInstance.post('getProjects');
}
