# EthRome 2025

AI chat with Civic Nexus MCP and Nansen MCP integration.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory and add these:

```bash
OPENAI_API_KEY=your_openai_api_key_here
NANSEN_API_KEY=your_nansen_api_key_here

CIVIC_AUTH_CLIENT_ID=your_civic_auth_client_id_here
```

### Install Dependencies

```bash
pnpm install
```

## Develop

```bash
pnpm dev
```

App runs on http://localhost:3000.

## Build

```bash
pnpm build && pnpm start
```