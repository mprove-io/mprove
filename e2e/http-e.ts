// tslint:disable:max-line-length

import { baseDomain, initialToken } from './e2e.config';

const request = require('superagent');

export class HttpE {
  isEnableE2e() {
    return request
      .get(baseDomain + '/e2e/enable')
      .set('Authorization', 'Bearer ' + initialToken)
      .set('Accept', 'application/json')
      .set('Cookie', 'mprove-skip-auth=42')
      .then((res: any) => {
        if (res.ok) {
          console.log('\x1b[32m%s\x1b[0m', 'E2E enable Success');
          // console.log(JSON.stringify(res.body));
          return true;
        } else {
          console.error('\x1b[31m%s\x1b[0m', 'E2E enable FAIL');
          console.log(JSON.stringify(res.body));
          return false;
        }
      })
      .catch((err: any) => {
        console.error('\x1b[31m%s\x1b[0m', 'E2E enable Error', err);
        return false;
      });
  }

  clean() {
    return request
      .post(baseDomain + '/e2e/test.clean')
      .send({
        info: {
          origin: 'test',
          type: 'request',
          request_id: '2a26da04624940d59d3c5ffa2f61f34d'
        },
        payload: { empty: true }
      }) // sends a JSON post body
      .set('Authorization', 'Bearer ' + initialToken)
      .set('Accept', 'application/json')
      .set('Cookie', 'mprove-skip-auth=42')
      .then((res: any) => {
        if (res && res.body && res.body.payload && res.body.payload.cleaned) {
          console.log('\x1b[32m%s\x1b[0m', 'Clean Success');
          // console.log(JSON.stringify(res.body));
          return true;
        } else {
          console.error('\x1b[31m%s\x1b[0m', 'Clean FAIL');
          console.log(JSON.stringify(res.body));
          return false;
        }
      })
      .catch((err: any) => {
        console.error('Clean Error', err);
        return false;
      });
  }

  start() {
    return request
      .post(baseDomain + '/e2e/test.start')
      .send({
        info: {
          origin: 'test',
          type: 'request',
          request_id: '2a26da04624940d59d3c5ffa2f61f34d'
        },
        payload: { empty: true }
      }) // sends a JSON post body
      .set('Authorization', 'Bearer ' + initialToken)
      .set('Accept', 'application/json')
      .set('Cookie', 'mprove-skip-auth=42')
      .then((res: any) => {
        if (res && res.body && res.body.payload && res.body.payload.started) {
          console.log('\x1b[32m%s\x1b[0m', 'Start Success');
          // console.log(JSON.stringify(res.body));
          return true;
        } else {
          console.error('\x1b[31m%s\x1b[0m', 'Start FAIL');
          console.log(JSON.stringify(res.body));
          return false;
        }
      })
      .catch((err: any) => {
        console.error('\x1b[31m%s\x1b[0m', 'Start Error', err);
        return false;
      });
  }

  finish() {
    return request
      .post(baseDomain + '/e2e/test.finish')
      .send({
        info: {
          origin: 'test',
          type: 'request',
          request_id: '2a26da04624940d59d3c5ffa2f61f34d'
        },
        payload: { empty: true }
      }) // sends a JSON post body
      .set('Authorization', 'Bearer ' + initialToken)
      .set('Accept', 'application/json')
      .set('Cookie', 'mprove-skip-auth=42')
      .then((res: any) => {
        if (res && res.body && res.body.payload && res.body.payload.finished) {
          console.log('\x1b[32m%s\x1b[0m', 'Finish Success');
          // console.log(JSON.stringify(res.body));
          return true;
        } else {
          console.error('\x1b[31m%s\x1b[0m', 'Finish FAIL');
          console.log(JSON.stringify(res.body));
          return false;
        }
      })
      .catch((err: any) => {
        console.error('\x1b[31m%s\x1b[0m', 'Finish Error', err);
        return false;
      });
  }
}
