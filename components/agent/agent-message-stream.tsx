'use client';

import { useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentMessage, type AgentMessageData } from './agent-message';

interface AgentMessageStreamProps {
  messages: AgentMessageData[];
  className?: string;
  autoScroll?: boolean;
  summaryActions?: {
    onSave?: () => void;
    onStartOver?: () => void;
    isSaving?: boolean;
  };
}

export function AgentMessageStream({ 
  messages, 
  className,
  autoScroll = true,
  summaryActions,
}: AgentMessageStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const lastScrollTop = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current || isUserScrolling.current) return;
    
    const container = containerRef.current;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    if (scrollTop < lastScrollTop.current) {
      isUserScrolling.current = true;
    }
    
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (isAtBottom) {
      isUserScrolling.current = false;
    }
    
    lastScrollTop.current = scrollTop;
  }, []);

  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages.length, autoScroll, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      isUserScrolling.current = false;
    }
  }, [messages.length]);

  const enhancedMessages = messages.map(message => {
    if (message.type === 'summary' && message.summaryData && summaryActions) {
      return {
        ...message,
        summaryData: {
          ...message.summaryData,
          onSave: summaryActions.onSave,
          onStartOver: summaryActions.onStartOver,
          isSaving: summaryActions.isSaving,
        },
      };
    }
    return message;
  });

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        'flex flex-col overflow-y-auto',
        'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {enhancedMessages.map((message) => (
          <AgentMessage key={message.id} message={message} />
        ))}
      </AnimatePresence>
      
      {messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center text-muted-foreground/60">
            <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <svg
                className="h-6 w-6 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
            <p className="text-sm">Agent analysis will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
