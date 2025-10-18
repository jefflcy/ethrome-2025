import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToCoreMessages,
  experimental_createMCPClient as createMCPClient,
} from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getTokens } from "@civic/auth-web3/nextjs";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// CIVIC NEXUS MPC SETUP
export const getNexusTools = async () => {
  const { accessToken } = (await getTokens()) ?? {};
  if (!accessToken) {
    // Return empty tools if no access token (Nexus is optional)
    return {};
  }

  try {
    const transport = new StreamableHTTPClientTransport(
      new URL("https://nexus.civic.com/hub/mcp"),
      {
        requestInit: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const mcpClient = await createMCPClient({ transport });
    return mcpClient.tools();
  } catch (error) {
    console.warn("Failed to load Nexus tools, continuing without them:", error);
    return {};
  }
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Nexus tools
    const nexusTools = await getNexusTools();

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: convertToCoreMessages(messages),
      tools: nexusTools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process request";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
