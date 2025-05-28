import type { Content } from '@google/genai';

export type Session = {
    id: string;
    title: string;
    history: Content[];
};