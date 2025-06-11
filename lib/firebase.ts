import { Firestore } from '@google-cloud/firestore';

let firestore;

if (process.env.NODE_ENV === 'production') {
  // In production (on Cloud Run), the library automatically finds the credentials.
  firestore = new Firestore();
} else {
  // In development, we use the key file.
  firestore = new Firestore({
    keyFilename: './service-account-key.json',
  });
}

export { firestore };