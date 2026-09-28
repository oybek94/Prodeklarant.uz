// Telegram'ga haqiqiy so'rov yuborilmaydi — global fetch almashtiriladi.
process.env.TELEGRAM_BOT_TOKEN = 'test-token';
process.env.TELEGRAM_CHAT_ID = '42';

const test = require('node:test');
const assert = require('node:assert/strict');
const { telegramText, notifyTelegram } = require('../services/leadNotify');

const lead = {
  name: 'Aziz <b>', phone: '+998901234567', product: 'gilos', country: 'Rossiya',
  comment: '5 fura', tariff: 'optimal', locale: 'ru', sourcePath: '/ru',
};

test('telegramText: escapes HTML and uses Uzbek labels', () => {
  const text = telegramText(7, lead);
  assert.match(text, /#7/);
  assert.match(text, /Aziz &lt;b&gt;/);
  assert.match(text, /\+998 90 123 45 67/);
  assert.match(text, /Gilos/);
  assert.match(text, /Optimal/);
  assert.match(text, /\/ru \(ru\)/);
});

test('notifyTelegram: posts to the bot API with chat id from env', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body) });
    return new Response('{"ok":true}', { status: 200 });
  });
  assert.equal(await notifyTelegram(7, lead), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.telegram.org/bottest-token/sendMessage');
  assert.equal(calls[0].body.chat_id, '42');
  assert.equal(calls[0].body.parse_mode, 'HTML');
});

test('notifyTelegram: returns false (does not throw) when Telegram fails', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('bad', { status: 400 }));
  t.mock.method(console, 'error', () => {});
  assert.equal(await notifyTelegram(7, lead), false);

  t.mock.method(globalThis, 'fetch', async () => { throw new Error('network'); });
  assert.equal(await notifyTelegram(7, lead), false);
});
