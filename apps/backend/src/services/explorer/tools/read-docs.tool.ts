import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { ExplorerDocsService } from '#backend/services/explorer/explorer-docs.service';

@Injectable()
export class ReadDocsToolService {
  constructor(private explorerDocsService: ExplorerDocsService) {}

  makeTool(): Tool {
    return tool({
      description: `Read cached Mprove documentation files sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx. 
Call with no arguments to list all available content/docs MDX files. 
Call with a filePath to read that file. 
Use this to look up chart YAML fields, model syntax, and other Mprove concepts.`,
      inputSchema: z.object({
        filePath: z
          .string()
          .nullish()
          .describe(
            'Path of the MDX file relative to content/docs, e.g. "reference/chart.mdx". Omit to list all files.'
          )
      }),
      execute: async input => {
        let result = await this.explorerDocsService.readDoc({
          filePath: input.filePath
        });

        return result;
      }
    });
  }
}
