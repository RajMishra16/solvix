import { AzureOpenAI } from 'openai';

// Get Gemini (Azure OpenAI) client
export function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = process.env.GEMINI_ENDPOINT;
    const apiVersion = process.env.GEMINI_API_VERSION;

    if (!apiKey || !endpoint || !apiVersion) {
        throw new Error('Missing Gemini (Azure OpenAI) configuration');
    }

    return new AzureOpenAI({
        apiKey,
        endpoint,
        apiVersion,
    });
}

// Chat with Gemini
export async function geminiChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
        maxTokens?: number;
    }
): Promise<string> {
    const client = getGeminiClient();
    const modelName = process.env.GEMINI_MODEL!;

    const response = await client.chat.completions.create({
        messages,
        model: modelName,
        max_completion_tokens: options?.maxTokens ?? 16384,
        // Note: GPT-5 mini doesn't support custom temperature, uses default (1)
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response content from Gemini');
    }

    return content;
}

// Chat with Gemini expecting JSON response
export async function geminiChatJson<T = unknown>(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
        maxTokens?: number;
    }
): Promise<T> {
    const content = await geminiChat(messages, options);

    // Extract JSON from response
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
        throw new Error('No JSON payload found in response');
    }

    return JSON.parse(content.slice(start, end + 1)) as T;
}

// Streaming chat with Gemini - yields text chunks as they arrive
export async function* geminiChatStream(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
        maxTokens?: number;
        disableReasoning?: boolean;
    }
): AsyncGenerator<string, void, unknown> {
    const client = getGeminiClient();
    const modelName = process.env.GEMINI_MODEL!;

    const stream = await client.chat.completions.create({
        messages,
        model: modelName,
        max_completion_tokens: options?.maxTokens ?? 16384,
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            yield content;
        }
    }
}
