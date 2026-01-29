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
    priceBrazil?: number | null;
    image?: string;
    category?: string;
    discount?: number;
    store?: string;
    brand?: string;
    description?: string;
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
    threadId: string | null;
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
    const [threadId, setThreadId] = useState<string | null>(() => {
        // Recuperar threadId da sessão anterior
        return localStorage.getItem('lg.ai.threadId');
    });
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
                    threadId, // Reutilizar thread existente
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
            let fullTextReceived = '';
            let productsReceived: Product[] = [];

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

                            // Guardar threadId se receber novo
                            if (data.threadId && !threadId) {
                                setThreadId(data.threadId);
                                localStorage.setItem('lg.ai.threadId', data.threadId);
                            }

                            if (data.type === 'message' && data.text) {
                                fullTextReceived = data.text;
                            } else if (data.text) {
                                fullTextReceived = data.text;
                            }

                            if (data.products && data.products.length > 0) {
                                productsReceived = data.products;
                            }

                            if (data.type === 'done' || data.done) {
                                break;
                            }
                        } catch (e) {
                            console.warn('SSE parse error:', e);
                        }
                    }
                }
            }

            // Efeito de typing - mostrar texto caractere por caractere
            if (fullTextReceived) {
                accumulatedText = fullTextReceived;
                const typingSpeed = 15; // ms por caractere (ajuste conforme necessário)

                for (let i = 0; i <= fullTextReceived.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, typingSpeed));
                    setStreaming(fullTextReceived.slice(0, i));

                    // Se tiver produtos, mostrar após 30% do texto
                    if (productsReceived.length > 0 && i === Math.floor(fullTextReceived.length * 0.3)) {
                        setProducts(productsReceived);
                    }
                }

                // Garantir que produtos apareçam no final
                if (productsReceived.length > 0) {
                    setProducts(productsReceived);
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
        threadId,
        submit,
        clearMessages,
        fetchSuggestions,
    };
}
