import 'dotenv/config';
import OpenAI from 'openai';

const xai = new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' });
const MODEL = process.env.XAI_MODEL || 'grok-4.20-0309-reasoning';

const TOOLS = [
  { type: 'function', function: { name: 'check_availability', description: 'find slots',
    parameters: { type: 'object', properties: { from_date: { type: 'string' } }, additionalProperties: false } } },
];

async function tryCase(label, body, opts) {
  process.stdout.write(`\n=== ${label} ===\n`);
  try {
    const resp = await xai.chat.completions.create(body, opts);
    const msg = resp.choices?.[0]?.message;
    console.log('OK. finish_reason=', resp.choices?.[0]?.finish_reason);
    console.log('content=', JSON.stringify(msg?.content));
    console.log('tool_calls=', msg?.tool_calls ? msg.tool_calls.length : 0);
    console.log('usage=', JSON.stringify(resp.usage));
  } catch (e) {
    console.log('THREW:', e?.status, e?.name, '-', e?.message);
    if (e?.error) console.log('error body:', JSON.stringify(e.error));
  }
}

// A) exact agent.ts shape: two system msgs + user "hey", max_completion_tokens, tools, custom header
await tryCase('A: exact agent shape (2 system, hey, tools, header, mct=8000)', {
  model: MODEL,
  max_completion_tokens: 8000,
  messages: [
    { role: 'system', content: 'You are Ray, a tattoo artist. Reply briefly.' },
    { role: 'system', content: 'Client memory: none yet.' },
    { role: 'user', content: 'hey' },
  ],
  tools: TOOLS,
}, { headers: { 'x-grok-conv-id': '+15555550133' } });

// B) is the MODEL name itself valid? minimal call
await tryCase('B: minimal, model only', {
  model: MODEL,
  messages: [{ role: 'user', content: 'say hi in 3 words' }],
});

// C) does max_completion_tokens work alone?
await tryCase('C: max_completion_tokens only', {
  model: MODEL,
  max_completion_tokens: 8000,
  messages: [{ role: 'user', content: 'say hi in 3 words' }],
});

// D) assistant tool_calls round-trip with content:'' (empty string) — agent.ts pushes content:''
await tryCase('D: assistant tool_calls with empty-string content round-trip', {
  model: MODEL,
  max_completion_tokens: 8000,
  messages: [
    { role: 'system', content: 'You are Ray.' },
    { role: 'user', content: 'what days are open?' },
    { role: 'assistant', content: '', tool_calls: [
      { id: 'call_1', type: 'function', function: { name: 'check_availability', arguments: '{}' } },
    ] },
    { role: 'tool', tool_call_id: 'call_1', content: 'Open: Tue 17th 11am' },
  ],
  tools: TOOLS,
});

process.exit(0);
