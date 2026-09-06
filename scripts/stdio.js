// Speak MCP over stdio to the Outlook server, using the locally signed-in account.
const { spawn } = require('child_process');

const ARGS = [
  '-y',
  '@softeria/ms-365-mcp-server',
  '--preset',
  'mail',
  '--org-mode',
  '--allowed-scopes',
  // shell:true concatenates without quoting on Windows, so quote it here or the
  // shell splits the scope list and only the first scope survives.
  '"Mail.ReadWrite MailboxSettings.Read MailboxSettings.ReadWrite User.Read"',
  '--expected-username',
  'them@company.com',
];

function client() {
  const p = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ARGS, {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });
  let buf = '';
  const waiters = new Map();
  p.stdout.on('data', (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.id && waiters.has(msg.id)) {
        waiters.get(msg.id)(msg);
        waiters.delete(msg.id);
      }
    }
  });
  p.stderr.on('data', (d) => {
    const s = d.toString();
    if (/error|Error|ERR/.test(s)) process.stderr.write(s);
  });

  let id = 0;
  function send(method, params, notify) {
    const body = notify
      ? { jsonrpc: '2.0', method, params }
      : { jsonrpc: '2.0', id: ++id, method, params };
    p.stdin.write(JSON.stringify(body) + '\n');
    if (notify) return Promise.resolve(null);
    return new Promise((res, rej) => {
      const myId = body.id;
      waiters.set(myId, res);
      setTimeout(() => {
        if (waiters.has(myId)) {
          waiters.delete(myId);
          rej(new Error('timeout on ' + method + ' ' + JSON.stringify(params).slice(0, 120)));
        }
      }, 120000);
    });
  }

  return {
    proc: p,
    send,
    async init() {
      await send('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'noam-survey', version: '1.0.0' },
      });
      await send('notifications/initialized', {}, true);
    },
    async call(name, args) {
      const r = await send('tools/call', { name, arguments: args || {} });
      if (r.error) return { error: r.error };
      const c = r.result && r.result.content;
      const text = Array.isArray(c) ? c.map((x) => x.text || '').join('\n') : '';
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    },
    close() {
      try {
        p.stdin.end();
        p.kill();
      } catch {}
    },
  };
}

module.exports = { client };
