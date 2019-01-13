import { Request, Response } from 'express';
import { api } from '../barrels/api';
import { barProject } from '../barrels/bar-project';

export let getProjects = async (req: Request, res: Response) => {
  let requestId: string;

  try {
    requestId = req.body['info']['request_id'];
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

  let basePath = process.env.BLOCKML_BASE_PATH;

  let dir = `${basePath}`;

  let projects: string[] = [];

  try {
    projects = await barProject.collectProjects({
      dir: dir
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

  res.json({
    info: {
      origin: api.CommunicationOriginEnum.BLOCKML,
      type: api.CommunicationTypeEnum.RESPONSE,
      reply_to: requestId,
      status: 'ok'
    },
    payload: {
      projects: projects,
      projects_total: projects.length
    }
  });
};
