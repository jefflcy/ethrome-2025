'use client';

import { Fragment, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { UserButton } from '@civic/auth-web3/react';

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
  const [model, setModel] = useState<string>(models[0].value);
  const { messages, sendMessage, status, regenerate } = useChat();

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
          model, // optional; remove if you don’t need server-side model switching
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
                      default:
                        return null;
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

              {/* Optional: remove this block entirely if you don’t need model switching */}
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
