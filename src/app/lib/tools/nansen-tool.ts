import { experimental_createMCPClient } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

let nansenClient: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;

export async function getNansenTools() {
  if (!nansenClient) {
    const transport = new StreamableHTTPClientTransport(
      new URL('https://mcp.nansen.ai/ra/mcp/'),
      {
        requestInit: {
          headers: {
            'NANSEN-API-KEY': process.env.NANSEN_API_KEY || '',
          },
        },
      }
    );
    
    nansenClient = await experimental_createMCPClient({ transport });
  }
  
  return await nansenClient.tools();
}

export async function closeNansenClient() {
  if (nansenClient) {
    await nansenClient.close();
    nansenClient = null;
  }
}
