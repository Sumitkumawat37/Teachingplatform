import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleAuthContextType {
  isSignedIn: boolean;
  accessToken: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  listDriveFiles: (folderId?: string) => Promise<any[]>;
  getDriveFile: (fileId: string) => Promise<any>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  return context;
};

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [gapiReady, setGapiReady] = useState(false);
  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not set - Google Drive features disabled');
      return;
    }

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(s);
      });

    const init = async () => {
      try {
        // Load gapi (Drive API calls) + GIS (new auth library)
        await Promise.all([
          loadScript('https://apis.google.com/js/api.js'),
          loadScript('https://accounts.google.com/gsi/client'),
        ]);

        // Init gapi client with Drive discovery doc only (no auth here)
        await new Promise<void>((resolve, reject) => {
          window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              });
              resolve();
            } catch (e) { reject(e); }
          });
        });

        // Init GIS token client (replaces deprecated gapi.auth2)
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
          callback: (response: any) => {
            if (response.access_token) {
              window.gapi.client.setToken({ access_token: response.access_token });
              setAccessToken(response.access_token);
              setIsSignedIn(true);
            }
          },
        });

        setGapiReady(true);
      } catch (error: any) {
        console.warn('Google Drive init error - features disabled:', error?.message ?? error);
      }
    };

    init();
  }, []);

  const signIn = async () => {
    if (!gapiReady || !tokenClientRef.current) {
      console.warn('Google Drive not ready');
      return;
    }
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  };

  const signOut = async () => {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    }
    window.gapi?.client?.setToken(null);
    setAccessToken(null);
    setIsSignedIn(false);
  };

  const listDriveFiles = async (folderId?: string) => {
    if (!accessToken) { console.error('Not signed in to Google Drive'); return []; }
    try {
      const q = folderId ? `'${folderId}' in parents and trashed=false` : 'trashed=false';
      const response = await window.gapi.client.drive.files.list({
        q,
        fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, size, modifiedTime)',
        pageSize: 100,
      });
      const allFiles: any[] = response.result.files || [];
      return allFiles.filter((file: any) => {
        const m = file.mimeType?.toLowerCase() || '';
        return m.includes('pdf') || m.includes('text') || m.includes('document') || m.includes('application/vnd.google');
      });
    } catch (error: any) {
      console.error('Error listing Drive files:', error);
      return [];
    }
  };

  const getDriveFile = async (fileId: string) => {
    if (!accessToken) return null;
    try {
      return await window.gapi.client.drive.files.get({ fileId, alt: 'media' });
    } catch (error) {
      console.error('Error getting Drive file:', error);
      return null;
    }
  };

  return (
    <GoogleAuthContext.Provider value={{ isSignedIn, accessToken, signIn, signOut, listDriveFiles, getDriveFile }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};
