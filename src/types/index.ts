
import type { Content } from '@google/genai';

export type ContentWithFile = Content & { fileNames?: string[] }

export type Session = {
    id: string;
    title: string;
    history: ContentWithFile[];
};