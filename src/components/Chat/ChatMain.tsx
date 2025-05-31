import { useEffect, useRef } from 'react';
import ThinkingDots from '../ThinkingDots';
import MessageBubble from './MessageBubble';
import type { Part } from '@google/genai';
import type { ContentWithFile } from '../../types';

interface Props {
    history: ContentWithFile[];
    sending: boolean;
    pendingFileParts: (Part & {
        fileName?: string;
    })[]
}
export default function ChatMain({ history, sending, pendingFileParts }: Props) {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, sending]);

    if (!history?.length && pendingFileParts?.length) {
        return (
            <div className='text-center text-xl text-fifth'>
                <h2 className="text-4xl mb-4 ">
                    ✅ Файл успішно завантажено!
                </h2>
                <div className="mb-4">
                    Тепер ви можете поставити запитання або написати запит щодо вмісту документа — система готова надати вам детальні відповіді й допомогти у прийнятті рішень.
                </div>
                <div>Введіть своє перше повідомлення 👇</div>
            </div>
        );
    }
    if (!history?.length) {
        return (
            <div className="text-center text-xl text-fifth mt-8">
                <h2 className="text-4xl mb-4">
                    Вітаємо у Чат-помічнику - інтелектуальній системі підтримки рішень!
                </h2>
                <div className="mb-4">
                    Цей додаток створений, щоб допомогти вам ефективно аналізувати документи та швидко отримувати відповіді на будь-які питання щодо їхнього змісту.
                </div>

                <div className="mb-4">
                    Щоб розпочати роботу:
                </div>

                <ul className="list-none space-y-2 mb-4">
                    <li className="flex items-start gap-2 text-justify leading-relaxed">
                        <span>
                            • Завантажте документ у форматі PDF або TXT.
                        </span>
                    </li>
                    <li className="flex items-start gap-2 text-justify leading-relaxed">
                        <span>
                            • Після завантаження ви зможете ставити питання або надавати команди, а система надасть вам чіткі та структуровані відповіді.
                        </span>
                    </li>
                </ul>

                Завантажте перший файл, і ми почнемо роботу! 🚀
            </div>
        );
    }

    return (
        <>

            {history.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {sending && <ThinkingDots />}
            <div ref={chatEndRef} />
        </>
    );
}