import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, ToolSet } from 'ai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { getTokens } from "@civic/auth/nextjs";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// CIVIC NEXUS MPC SETUP
async function createMCPClient() {
  // Get Civic Auth token for Nexus authentication
  const tokens = await getTokens();
  const accessToken = tokens?.accessToken;
  if (!accessToken) {
    throw new Error('Missing access token from Civic getTokens()');
  }
  
  // Create MCP transport with Nexus authentication headers
const transport = new StreamableHTTPClientTransport(
    new URL('https://nexus.civic.com/hub/mcp'),
    {
        requestInit: {
            headers: {
                // Required: Bearer token for Nexus authentication
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    }
);

  const client = new Client({
    name: 'my-ai-app',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  return client;
}


export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Connect to Nexus MCP Hub
  const client = await createMCPClient();
  const { tools } = await client.listTools();

  // Convert MCP tools to AI SDK v5 format
  const aiTools = tools.reduce((acc, tool) => {
    acc[tool.name] = {
      description: tool.description,
      parameters: tool.inputSchema,
      execute: async (args: any) => { // eslint-disable-line
        const result = await client.callTool({
          name: tool.name,
          arguments: args
        });
        return result.content;
      }
    };
    return acc;
  }, {} as Record<string, any>); // eslint-disable-line

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    tools: aiTools,
  });

  await client.close()
  return result.toUIMessageStreamResponse();
}