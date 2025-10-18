'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { UserButton } from "@civic/auth-web3/react";

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-transparent">
      {/* User button in the corner */}
      <div className="absolute top-4 right-4 z-10">
        <UserButton theme="dark" onSignOut={() => window.location.reload()} />
      </div>

      {/* Chat container with border */}
      <div className="flex flex-col w-full max-w-md h-[80vh] border border-zinc-300 dark:border-zinc-800 rounded-xl shadow-xl bg-white dark:bg-zinc-900 p-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map(message => (
            <div key={message.id} className="whitespace-pre-wrap">
              <span className="font-semibold">
                {message.role === 'user' ? 'User: ' : 'AI: '}
              </span>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <span key={`${message.id}-${i}`}>{part.text}</span>;
                }
              })}
            </div>
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage({ text: input });
            setInput('');
          }}
          className="flex-shrink-0"
        >
          <input
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded shadow-inner dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            value={input}
            placeholder="Say something..."
            onChange={e => setInput(e.currentTarget.value)}
          />
        </form>
      </div>
    </div>
  );
}
