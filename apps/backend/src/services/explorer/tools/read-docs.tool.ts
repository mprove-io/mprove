import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { ExplorerDocsService } from '#backend/services/explorer/explorer-docs.service';

@Injectable()
export class ReadDocsToolService {
  constructor(private explorerDocsService: ExplorerDocsService) {}

  makeTool(): Tool {
    return tool({
      description: `Read Mprove documentation files sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx. 
Call with filePaths to read one or more files in one tool call.`,
      inputSchema: z.object({
        filePaths: z
          .array(z.string())
          .min(1)
          .describe(
            'One or more MDX file paths relative to content/docs, e.g. ["reference/chart.mdx"]. Use list_docs to see available files.'
          )
      }),
      execute: async input => {
        let result = await this.explorerDocsService.readDocs({
          filePaths: input.filePaths
        });

        return result;
      }
    });
  }
}
