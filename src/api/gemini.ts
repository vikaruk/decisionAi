import { GoogleGenAI, type Content } from '@google/genai';

const MODEL = 'gemini-2.0-flash';
export const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });

export function createChat(history: Content[]) {
    return ai.chats.create({ model: MODEL, history });
}

export async function uploadFile(file: File) {
    const uploaded = await ai.files.upload({ file, config: { displayName: file.name } });
    return uploaded;
}

export async function pollFileStatus(name: string) {
    let status = await ai.files.get({ name });
    while (status.state === 'PROCESSING') {
        await new Promise(res => setTimeout(res, 2000));
        status = await ai.files.get({ name });
    }
    if (status.state === 'FAILED') throw new Error('Upload failed');
    return status;
}