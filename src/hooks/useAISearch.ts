import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatMessage {
    type: 'user' | 'assistant';
    text: string;
}

interface Product {
    id: number;
    name: string;
    priceUSD: number;
    priceBRL: number;
    priceBrazil: number | null;
    image: string;
    category: string;
    discount?: number;
    store: string;
}

interface UseAISearchResult {
    query: string;
    setQuery: (q: string) => void;
    isTyping: boolean;
    streaming: string;
    messages: ChatMessage[];
    products: Product[];
    suggestions: string[];
    sessionId: string;
    submit: (message?: string) => void;
    clearMessages: () => void;
    fetchSuggestions: (q: string) => void;
}

export function useAISearch(): UseAISearchResult {
    const [query, setQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [streaming, setStreaming] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [sessionId] = useState(() => {
        const key = 'lg.ai.sessionId';
        let sid = localStorage.getItem(key);
        if (!sid) {
            sid = `web_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
            localStorage.setItem(key, sid);
        }
        return sid;
    });

    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Submeter busca
    const submit = useCallback(async (customMessage?: string) => {
        const messageToSend = customMessage || query.trim();
        if (!messageToSend) return;

        // Adicionar mensagem do usuário
        setMessages(prev => [...prev, { type: 'user', text: messageToSend }]);
        setQuery('');
        setProducts([]);
        setIsTyping(true);
        setStreaming('');

        // Cancelar stream anterior
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        let accumulatedText = '';

        try {
            const response = await fetch('/api/assistant/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageToSend,
                    sessionId,
                    horaLocal: new Date().getHours(),
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            readerRef.current = reader;
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const eventData = line.slice(6);
                        if (eventData === '[DONE]') continue;

                        try {
                            const data = JSON.parse(eventData);

                            if (data.text) {
                                accumulatedText = data.text;
                                setStreaming(data.text);
                            }

                            if (data.products && data.products.length > 0) {
                                setProducts(data.products);
                            }

                            if (data.done) {
                                break;
                            }
                        } catch (e) {
                            console.warn('SSE parse error:', e);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Stream error:', error);
                accumulatedText = '❌ Ops! Problema na conexão. Tenta de novo?';
                setStreaming(accumulatedText);
            }
        } finally {
            setIsTyping(false);

            if (accumulatedText) {
                setMessages(prev => [...prev, { type: 'assistant', text: accumulatedText }]);
            }

            setStreaming('');
            readerRef.current = null;
        }
    }, [query, sessionId]);

    // Buscar sugestões (autocomplete)
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`/api/assistant/suggestions?q=${encodeURIComponent(q)}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }, []);

    // Limpar mensagens
    const clearMessages = useCallback(() => {
        setMessages([]);
        setProducts([]);
        setStreaming('');
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        query,
        setQuery,
        isTyping,
        streaming,
        messages,
        products,
        suggestions,
        sessionId,
        submit,
        clearMessages,
        fetchSuggestions,
    };
}
