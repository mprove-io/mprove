import * as cluster from 'cluster';
import { helper } from './barrels/helper';

export class ServerWorkers {

  private static busyWorkers: { [key: string]: number } = {};

  static delete(workerPid: number) {
    delete this.busyWorkers[workerPid];
  }

  static async get() {

    let freeWorkers: { [pid: number]: number } = {};

    let restart = true;

    while (restart) {

      restart = false;

      Object.keys(cluster.workers).forEach(id => {

        let pid: number = cluster.workers[id].process.pid;

        if (!this.busyWorkers[pid]) {
          freeWorkers[pid] = 1;
        }
      });

      if (Object.keys(freeWorkers).length === 0) {
        await helper.delay(10);
        restart = true;
      }
    }

    let freeKeys = Object.keys(freeWorkers);

    let workerPid = freeKeys[freeKeys.length * Math.random() << 0];

    this.busyWorkers[workerPid] = 1;

    let workerId = Object.keys(cluster.workers).find(
      x => cluster.workers[x].process.pid.toString() === workerPid
    );

    let worker = cluster.workers[workerId];

    return worker;
  }
}