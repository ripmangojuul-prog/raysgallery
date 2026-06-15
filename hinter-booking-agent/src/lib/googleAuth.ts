import { google } from 'googleapis';

// OAuth2 client that acts AS Ray's personal Google account.
//
// IMPORTANT: a service account CANNOT touch a personal @gmail.com calendar or
// send guest invites the normal way — so we use an installed-app OAuth client
// with a long-lived refresh token (generated once via `npm run get-token`).

const REQUIRED = ['GCAL_CLIENT_ID', 'GCAL_CLIENT_SECRET'] as const;

export function makeOAuthClient() {
  for (const k of REQUIRED) {
    if (!process.env[k]) throw new Error(`${k} is not set (see .env.example).`);
  }
  return new google.auth.OAuth2(
    process.env.GCAL_CLIENT_ID,
    process.env.GCAL_CLIENT_SECRET,
    // Loopback redirect for the one-time token script. Desktop/installed OAuth
    // clients match on localhost + any port (the registered URI is http://localhost),
    // so we keep the path at root to avoid redirect_uri_mismatch.
    'http://localhost:53682'
  );
}

/** Authorized calendar client for runtime use (requires GCAL_REFRESH_TOKEN). */
export function calendarClient() {
  const auth = makeOAuthClient();
  if (!process.env.GCAL_REFRESH_TOKEN) {
    throw new Error('GCAL_REFRESH_TOKEN is not set. Run `npm run get-token` once to generate it.');
  }
  auth.setCredentials({ refresh_token: process.env.GCAL_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth });
}

export const CALENDAR_ID = process.env.GCAL_CALENDAR_ID || 'rscatchings@gmail.com';

// Scopes needed: read availability + create events + invite guests.
export const GCAL_SCOPES = ['https://www.googleapis.com/auth/calendar'];
