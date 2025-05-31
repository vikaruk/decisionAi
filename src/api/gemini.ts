import { GoogleGenAI, Type, type Content, type Part } from '@google/genai';

const MODEL = 'gemini-2.0-flash';
export const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });

export function createChat(history?: Content[]) {
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

export async function extractTitleFromFile(filePart?: Part): Promise<string> {
    if (!filePart) return ''
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            { role: 'user', parts: [{ text: 'Будь ласка, прочитай цей документ і поверни на основі цього файлу короткий title у форматі JSON з полем title.' }, filePart] }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING }
                },
                propertyOrdering: ["title"]
            }
        }
    });

    console.log(response.text)

    // 4. Парсимо JSON-відповідь
    //    response.text містить JSON-рядок типу: [{"title":"Щось тут"}]
    try {
        if (!response.text) throw Error()
        const objWithText = JSON.parse(response.text) as { title: string };
        return objWithText.title
    } catch {
        return '';
    }
}