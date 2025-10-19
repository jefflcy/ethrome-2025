'use client';

import { Fragment, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { UserButton } from '@civic/auth-web3/react';
import { useAutoConnect } from '@civic/auth-web3/wagmi';
import { useAccount, useSendTransaction, useBalance } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '@/components/client-providers';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Action, Actions } from '@/components/ai-elements/actions';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';

const models = [
  { name: 'GPT 4o mini', value: 'gpt-4o-mini' },
];

export default function Chat() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>(models[0].value);
  const { messages, sendMessage, status, regenerate } = useChat();
  
  // Initialize Civic embedded wallet auto-connect
  useAutoConnect();

  // Read wallet connection state from wagmi
  const { address, isConnected } = useAccount();

  // Fetch ETH balance on Base mainnet (chainId 8453)
  const { data: balanceData, isLoading: balanceLoading } = useBalance(
    address
      ? {
          address: address as `0x${string}`,
          chainId: 8453,
        }
      : undefined
  );

  const truncate = (addr?: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

  function ToolTxSender({ tx }: { tx: { to: `0x${string}`; data: `0x${string}`; value: string } }) {
    const { data: hash, sendTransaction } = useSendTransaction();

    const handleSend = async () => {
      try {
        sendTransaction({ to: tx.to, data: tx.data, value: BigInt(tx.value || '0') });

        const receipt = waitForTransactionReceipt(wagmiConfig, {
          hash: hash!
        });
      } catch (e) {
        console.error('sendTransaction error', e);
      }
    };

    return (
      <div className="mt-2">
        <div className="text-xs text-zinc-500">Transaction payload from tool:</div>
        <pre className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-xs overflow-x-auto">{JSON.stringify(tx, null, 2)}</pre>
        <div className="flex gap-2 items-center mt-2">
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
            onClick={handleSend}
          >
            Sign & Send
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text && message.text.trim().length > 0);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;

    sendMessage(
      {
        text: hasText ? message.text! : 'Sent with attachments',
        files: message.files,
      },
      {
        body: {
          walletAddress: isConnected ? address : ''
        },
      },
    );
    setInput('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-transparent">
      {/* User button in the corner */}
      <div className="absolute top-4 right-4 z-10">
        <UserButton theme="dark" onSignOut={() => window.location.reload()} />
      </div>

      {/* Wallet status above the chat card */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-sm text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          {isConnected ? (
            <button
              aria-label="Copy wallet address"
              className="flex items-center gap-2 focus:outline-none cursor-pointer transition-transform duration-150 ease-in-out hover:scale-105 hover:shadow-md active:scale-100 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-0.5"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address ?? '');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                } catch (e) {
                  console.error('copy failed', e);
                }
              }}
            >
              <span className="text-zinc-600 dark:text-zinc-300">Connected:</span>
              <span className="font-mono text-sm">{truncate(address)}</span>
              <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-300">
                {balanceLoading ? '—' : balanceData ? `${balanceData.formatted} ${balanceData.symbol ?? 'ETH'}` : ''}
              </span>
              <span className="ml-2 flex items-center">
                {copied ? (
                  <svg className="w-4 h-4 text-green-600 transition-opacity duration-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-300 transition-opacity duration-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          ) : (
            'Wallet: disconnected'
          )}
        </div>
      </div>

      {/* Centered chat card */}
      <div className="flex flex-col w-full max-w-md h-[80vh] border border-zinc-300 dark:border-zinc-800 rounded-xl shadow-xl bg-white dark:bg-zinc-900 p-4">
        {/* Conversation */}
        <div className="flex-1 min-h-0">
          <Conversation className="h-full">
            <ConversationContent>
              {messages.map((message) => (
                <div key={message.id} className="space-y-1">
                  {message.role === 'assistant' &&
                    message.parts.filter((p) => p.type === 'source-url').length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={message.parts.filter((p) => p.type === 'source-url').length}
                        />
                        {message.parts
                          .filter((p) => p.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-src-${i}`}>
                              <Source href={part.url} title={part.url} />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}

                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response>{part.text}</Response>
                              </MessageContent>
                            </Message>
                            {message.role === 'assistant' &&
                              message.id === messages.at(-1)?.id &&
                              i === message.parts.length - 1 && (
                                <Actions className="mt-2">
                                  <Action onClick={() => regenerate()} label="Retry" />
                                  <Action
                                    onClick={() =>
                                      typeof part.text === 'string' &&
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  />
                                </Actions>
                              )}
                          </Fragment>
                        );
                      case 'reasoning':
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === 'streaming' &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default: {
                        // Render tool parts (the ai-sdk uses part.type like 'tool-<name>')
                        if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                          const toolPart = part as unknown as Record<string, unknown>;
                          const state = toolPart.state as string | undefined;

                          if (state === 'input-streaming' || state === 'input-available') {
                            return (
                              <div key={`${message.id}-${i}`} className="p-2 text-sm text-zinc-500">
                                Calling tool {part.type.replace('tool-', '')}...
                              </div>
                            );
                          }

                          if (state === 'output-available') {
                            const output = toolPart.output as unknown;

                            // If output looks like a transaction payload, render signer UI
                            if (
                              output &&
                              typeof output === 'object' &&
                              'to' in (output as Record<string, unknown>) &&
                              'data' in (output as Record<string, unknown>)
                            ) {
                              const tx = output as { to: `0x${string}`; data: `0x${string}`; value: string };
                              return (
                                <Fragment key={`${message.id}-${i}`}>
                                  <Message from={message.role}>
                                    <MessageContent>
                                      <Response>{`Tool ${part.type.replace('tool-', '')} returned a transaction.`}</Response>
                                    </MessageContent>
                                  </Message>
                                  <ToolTxSender tx={tx} />
                                </Fragment>
                              );
                            }

                            // Don't render tool output - let the AI include it in the text response
                            return null;
                          }

                          if (state === 'output-error') {
                            return (
                              <Message key={`${message.id}-${i}`} from={message.role}>
                                <MessageContent>
                                  <Response className="text-red-600">{String(toolPart.error ?? 'Tool error')}</Response>
                                </MessageContent>
                              </Message>
                            );
                          }

                          return null;
                        }

                        return null;
                      }
                    }
                  })}
                </div>
              ))}
              {status === 'submitted' && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        {/* Prompt input */}
        <PromptInput onSubmit={handleSubmit} className="mt-3" globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Say something..."
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <PromptInputModelSelect
                onValueChange={(value) => setModel(value)}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((m) => (
                    <PromptInputModelSelectItem key={m.value} value={m.value}>
                      {m.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>

            <PromptInputSubmit disabled={!input && status !== 'streaming'} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
