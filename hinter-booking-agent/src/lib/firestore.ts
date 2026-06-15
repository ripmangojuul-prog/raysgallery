import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

// Lazy Firestore init — connects on FIRST use, not at import. This lets the
// brain / console tester run with only an xAI key; Firestore is only
// touched when a tool actually persists something (deposit claim, booking).

let _db: Firestore | null = null;

function init() {
  if (getApps().length) return;
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIRESTORE_PROJECT_ID;
  try {
    if (credsPath) {
      const sa = JSON.parse(readFileSync(credsPath, 'utf8'));
      initializeApp({ credential: cert(sa), projectId: projectId || sa.project_id });
    } else {
      initializeApp({ credential: applicationDefault(), projectId });
    }
  } catch (err) {
    throw new Error(
      `Failed to init Firestore. Check GOOGLE_APPLICATION_CREDENTIALS / FIRESTORE_PROJECT_ID. ${String(err)}`
    );
  }
}

export function getDb(): Firestore {
  if (_db) return _db;
  init();
  _db = getFirestore();
  // Don't throw on undefined fields — we write partial profiles as they fill in.
  _db.settings({ ignoreUndefinedProperties: true });
  return _db;
}
