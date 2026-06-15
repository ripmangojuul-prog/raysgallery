// One-time: generate a Google Calendar OAuth refresh token for rscatchings@gmail.com.
// Run: npm run get-token  (then paste the printed token into .env as GCAL_REFRESH_TOKEN)
import 'dotenv/config';
import http from 'node:http';
import { makeOAuthClient, GCAL_SCOPES } from '../src/lib/googleAuth.js';

async function main() {
  const oauth = makeOAuthClient();
  const url = oauth.generateAuthUrl({
    access_type: 'offline', // ensures a refresh_token is returned
    prompt: 'consent',
    scope: GCAL_SCOPES,
  });

  console.log('\n=== Google Calendar authorization ===');
  console.log('Open this URL, sign in as rscatchings@gmail.com, and approve:\n');
  console.log(url + '\n');

  const code: string = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url || '', 'http://localhost:53682');
      const c = u.searchParams.get('code');
      if (c) {
        res.end('Authorized. You can close this tab and return to the terminal.');
        server.close();
        resolve(c);
      } else {
        res.end('Waiting for authorization code...');
      }
    });
    server.listen(53682, () => console.log('Listening for the redirect on http://localhost:53682 ...'));
    server.on('error', reject);
  });

  const { tokens } = await oauth.getToken(code);
  if (!tokens.refresh_token) {
    console.error('\nNo refresh_token returned. Remove this app from your Google account permissions and try again.');
    process.exit(1);
  }
  console.log('\n=== SUCCESS ===');
  console.log('Add this to your .env:\n');
  console.log(`GCAL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
