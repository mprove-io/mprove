import { Request, Response } from 'express';
import { api } from '../barrels/api';
import { wrapper } from '../barrels/wrapper';

export let rebuildStruct = async (req: Request, res: Response) => {

  let requestId: string;
  let projectId: string;
  let repoId: string;
  let bqProject: string;
  let weekStart: api.ProjectWeekStartEnum;
  let structId: string;

  try {
    requestId = req.body['info']['request_id'];
    projectId = req.body['payload']['project_id'];
    repoId = req.body['payload']['repo_id'];
    bqProject = req.body['payload']['bq_project'];
    weekStart = req.body['payload']['week_start'];
    structId = req.body['payload']['struct_id'];

  } catch (e) {

    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'blockml_wrong_request_params',
        error: {
          message: e.stack
        }
      },
      payload: undefined
    });
  }

  let basePath = process.env.BASE_PATH;

  let dir = `${basePath}/${projectId}/${repoId}`;

  let ws: {
    wrappedStruct: api.StructFull,
    udfsContent: string,
    pdts_sorted: string[],
  };

  try {

    ws = await wrapper.wrapStruct({
      dir: dir,
      weekStart: weekStart,
      bqProject: bqProject,
      projectId: projectId,
      repoId: repoId,
      structId: structId,
    });

  } catch (err) {

    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'blockml_internal_error',
        error: {
          message: err.stack
        }
      },
      payload: undefined
    });
  }

  if (ws) {

    res.json({
      info: {
        origin: api.CommunicationOriginEnum.BLOCKML,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: requestId,
        status: 'ok'
      },
      payload: {
        struct: ws.wrappedStruct,
        udfs_content: ws.udfsContent,
        pdts_sorted: ws.pdts_sorted,
      }
    });
  }

};
