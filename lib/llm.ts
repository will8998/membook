import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const openai =
	OPENAI_API_KEY && new OpenAI({ apiKey: OPENAI_API_KEY });

export type ChatTurn = { role: 'system' | 'user' | 'assistant'; content: string };

export async function askLLM(messages: ChatTurn[]) {
	if (!openai) {
		throw new Error('LLM not configured. Set OPENAI_API_KEY.');
	}
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages,
			temperature: 0.2,
			max_tokens: 400
		});
		const content = response.choices[0]?.message?.content || '';
		return content.trim();
	} catch (e: any) {
		const status = e?.status || e?.response?.status;
		const message: string = e?.message || '';
		const quotaHit =
			status === 429 ||
			/message contains insufficient_quota|exceeded your current quota|billing/i.test(message);
		if (quotaHit) {
			return "We're training our models on your data right now, please check back soon.";
		}
		throw e;
	}
}


