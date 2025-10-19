# SmartNexus - EthRome 2025

AI chat with Civic Nexus integrated with Nansen MCP and 1inch Swap API tool.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory and add these:

```bash
OPENAI_API_KEY=your_openai_api_key_here
NANSEN_API_KEY=your_nansen_api_key_here
ONEINCH_API_KEY=your_1inch_api_key_here
CIVIC_AUTH_CLIENT_ID=your_civic_auth_client_id_here

NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

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