import { useEffect, useRef } from 'react';
import ThinkingDots from '../ThinkingDots';
import MessageBubble from './MessageBubble';
import type { Content } from '@google/genai';

interface Props {
    history: Content[];
    sending: boolean;
}
export default function ChatMain({ history, sending }: Props) {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, sending]);

    if (!history) return null;

    return (
        <>
            {history.slice(1).map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {sending && <ThinkingDots />}
            <div ref={chatEndRef} />
        </>
    );
}