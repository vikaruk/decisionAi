import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Content } from '@google/genai';
import TailIcon from '../icons/TailIcon';
import type { CSSProperties } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Props { msg: Content; }

export default function MessageBubble({ msg }: Props) {
    const { theme } = useTheme()
    const isDarkTheme = theme === 'dark'
    const isUser = msg.role === 'user';
    const message = msg.parts?.map(p => p.text)?.join('')
    if (!message?.trim()) return null

    const styleBox: CSSProperties = isUser ? {
        height: '25px', width: '25px', position: "absolute",
        bottom: -18,
        right: 5,
    } : {
        height: '25px', width: '25px', position: "absolute",
        bottom: -18,
        left: 5,
    }

    return (
        <div className={`relative flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`${isUser ? 'text-white dark:text-gray-950 bg-primary' : 'text-text border border-border  dark:bg-background'} px-4 py-2 rounded-xl max-w-[80%] prose prose-sm overflow-x-auto`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message}
                </ReactMarkdown>
            </div>
            <TailIcon className={`z-0 ${isUser ? '' : 'scale-x-[-1]'}`} style={styleBox} colorTheme={isUser ? 'primary' : isDarkTheme ? 'bg' : ''} />
        </div>
    );
}