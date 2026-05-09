import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { deleteChatSession, streamChatMessage } from '../api/chatbot';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

let _id = 0;
function nextId() {
  return String(++_id);
}

export function ChatbotPopup() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Delete session on unmount (page close / navigation away)
  useEffect(() => {
    return () => {
      deleteChatSession(sessionId);
    };
  }, [sessionId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, isOpen]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: text }]);
    setInputValue('');
    setIsStreaming(true);
    setStreamingContent('');

    let accumulated = '';

    await streamChatMessage(
      sessionId,
      text,
      (chunk) => {
        accumulated += chunk;
        setStreamingContent(accumulated);
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: accumulated },
        ]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: t('chatbot.errorMessage') },
        ]);
        setStreamingContent('');
        setIsStreaming(false);
      },
    );
  }, [inputValue, isStreaming, sessionId, t]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Auto-grow textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
  };

  const showTypingDots = isStreaming && !streamingContent;

  return (
    <>
      {isOpen && (
        <div className="chatbot-popup" role="dialog" aria-modal="true" aria-label={t('chatbot.title')}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">
              <Icon name="sparkles" size={17} color="#fff" />
              <div className="chatbot-online-dot" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                {t('chatbot.title')}
              </div>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.78,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#4ade80',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {t('chatbot.subtitle')}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsOpen(false)}
              aria-label={t('common.actions.cancel')}
              style={{ color: 'rgba(255,255,255,0.85)', padding: 6, minWidth: 0 }}
            >
              <Icon name="x" size={18} color="currentColor" />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {/* Static welcome message — always first, always translated */}
            <div className="chatbot-msg">
              <div className="chatbot-msg-avatar">
                <Icon name="sparkles" size={13} color="var(--accent)" />
              </div>
              <div className="chatbot-bubble chatbot-bubble-assistant">{t('chatbot.welcome')}</div>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-msg${msg.role === 'user' ? ' chatbot-msg-user' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="chatbot-msg-avatar">
                    <Icon name="sparkles" size={13} color="var(--accent)" />
                  </div>
                )}
                <div
                  className={`chatbot-bubble ${
                    msg.role === 'assistant'
                      ? 'chatbot-bubble-assistant'
                      : 'chatbot-bubble-user'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Streaming in-progress bubble */}
            {isStreaming && (
              <div className="chatbot-msg">
                <div className="chatbot-msg-avatar">
                  <Icon name="sparkles" size={13} color="var(--accent)" />
                </div>
                <div className="chatbot-bubble chatbot-bubble-assistant">
                  {showTypingDots ? (
                    <div className="chatbot-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    streamingContent
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer */}
          <div className="chatbot-disclaimer">{t('chatbot.disclaimer')}</div>

          {/* Input */}
          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder={t('chatbot.placeholder')}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isStreaming}
              aria-label={t('chatbot.placeholder')}
            />
            <button
              type="button"
              className="chatbot-send-btn"
              onClick={() => void handleSend()}
              disabled={isStreaming || !inputValue.trim()}
              aria-label={t('chatbot.send')}
            >
              <Icon name="send" size={15} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={t('chatbot.openChat')}
        aria-expanded={isOpen}
      >
        <Icon name={isOpen ? 'x' : 'message-circle'} size={19} color="#fff" />
        {!isOpen && <span>{t('chatbot.openChat')}</span>}
      </button>
    </>
  );
}
