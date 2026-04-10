import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithProvider = async (provider: GoogleAuthProvider, extraData?: { firstName?: string, lastName?: string, phone?: string, country?: string }) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Save user to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
      ...extraData
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
