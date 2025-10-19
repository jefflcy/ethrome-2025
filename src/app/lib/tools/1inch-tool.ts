import { base } from 'viem/chains';
import { z } from 'zod';

const apiKey = process.env.ONEINCH_API_KEY ?? '';
const baseUrl = `https://api.1inch.com/swap/v6.1/${base.id}`;

function buildQueryURL(path: string, params: Record<string, string>): string {
  const url = new URL(baseUrl + path);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

async function call1inchAPI<T>(endpointPath: string, queryParams: Record<string, string>): Promise<T> {
  const url = buildQueryURL(endpointPath, queryParams);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    console.error('1inch API error', response.status, text);
    throw new Error(`1inch API returned status ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Failed to parse 1inch response: ' + text);
  }
}

export type AllowanceResponse = { allowance: string };
export type ApproveTransactionResponse = { to: `0x${string}`; data: `0x${string}`; value: string; gasPrice?: string };
export type TxResponse = { tx: { to: `0x${string}`; data: `0x${string}`; value: string } };

/**
 * Check token allowance for the configured wallet
 */
export async function checkAllowance(tokenAddress: string, walletAddress: string) {
  console.log('[1inch] checkAllowance', { tokenAddress, walletAddress });

  const res = await call1inchAPI<AllowanceResponse>('/approve/allowance', {
    tokenAddress,
    walletAddress,
  });

  console.log('[1inch] allowance response', res);
  return BigInt(res.allowance);
}

/**
 * Get the approval transaction payload from 1inch (does not send tx)
 * Logs the response and (optionally) would sign/send with viem walletClient
 */
export async function getApproveTransaction(tokenAddress: string, amount: bigint) {
  console.log('[1inch] getApproveTransaction', { tokenAddress, amount: amount.toString() });

  const res = await call1inchAPI<ApproveTransactionResponse>('/approve/transaction', {
    tokenAddress,
    amount: amount.toString(),
  });

  console.log('[1inch] approve transaction payload', res);

  return res;
}

/**
 * Get swap transaction payload from 1inch (does not send tx). Logs swap payload.
 */
export async function getSwapTransaction(params: {
  srcToken: string;
  dstToken: string;
  amount: bigint;
  from: string;
  slippage?: number;
}) {
  const { srcToken, dstToken, amount, from, slippage = 1 } = params;
  const fromAddress = (from ?? '').toLowerCase();

  const swapParams: Record<string, string> = {
    src: srcToken,
    dst: dstToken,
    amount: amount.toString(),
    from: fromAddress,
    slippage: String(slippage),
    disableEstimate: 'false',
    allowPartialFill: 'false',
  };

  console.log('[1inch] getSwapTransaction', swapParams);
  const res = await call1inchAPI<TxResponse>('/swap', swapParams);

  console.log('[1inch] swap tx payload', res.tx);

  return res.tx;
}

// Input schemas
const CheckAllowanceInput = z.object({
  tokenAddress: z.string().min(1),
  walletAddress: z.string(),
});

const GetApproveTransactionInput = z.object({
  tokenAddress: z.string().min(1),
  amount: z.string().regex(/^\d+$/), // amount as integer string (wei)
});

const GetSwapTransactionInput = z.object({
  srcToken: z.string().min(1),
  dstToken: z.string().min(1),
  amount: z.string().regex(/^\d+$/),
  from: z.string(),
  slippage: z.number().optional(),
});

// Tool wrappers that the AI SDK can call. They validate input and return structured outputs.
export const checkAllowanceTool = {
  description: 'Check token allowance for the provided wallet address',
  inputSchema: CheckAllowanceInput,
  execute: async (rawInput: unknown) => {
    const parsed = CheckAllowanceInput.parse(rawInput);
    const allowance = await checkAllowance(parsed.tokenAddress, parsed.walletAddress);
    return { allowance: allowance.toString() };
  },
};

export const getApproveTransactionTool = {
  description: 'Get an approval transaction payload from 1inch Swap API for the provided token and amount.',
  inputSchema: GetApproveTransactionInput,
  execute: async (rawInput: unknown) => {
    const parsed = GetApproveTransactionInput.parse(rawInput);
    const res = await getApproveTransaction(parsed.tokenAddress, BigInt(parsed.amount));
    return res;
  },
};

export const getSwapTransactionTool = {
  description: 'Get a swap transaction payload from 1inch Swap API.',
  inputSchema: GetSwapTransactionInput,
  execute: async (rawInput: unknown) => {
    const parsed = GetSwapTransactionInput.parse(rawInput);

    const tx = await getSwapTransaction({
      srcToken: parsed.srcToken,
      dstToken: parsed.dstToken,
      amount: BigInt(parsed.amount),
      from: parsed.from,
      slippage: parsed.slippage,
    });
    return tx;
  },
};

