import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { ExplorerDocsService } from '#backend/services/explorer/explorer-docs.service';

@Injectable()
export class ListDocsToolService {
  constructor(private explorerDocsService: ExplorerDocsService) {}

  makeTool(): Tool {
    return tool({
      description: `List Mprove documentation MDX files sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx. 
Call this before read_docs to choose exact documentation file paths.`,
      inputSchema: z.object({}),
      execute: async () => {
        let result = this.explorerDocsService.listDocs();

        return result;
      }
    });
  }
}
