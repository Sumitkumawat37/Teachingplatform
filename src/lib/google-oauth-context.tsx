import React, { createContext, useContext, useState, useEffect } from 'react';

declare global {
  interface Window {
    gapi: any;
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
  const [gapi, setGapi] = useState<any>(null);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiError, setGapiError] = useState<string | null>(null);

  useEffect(() => {
    // Google Drive features disabled - not loading GAPI to avoid iframe sandbox warnings
    // Re-enable if Google Drive integration is needed in the future
    return;
  }, []);

  const signIn = async () => {
    if (!gapi || !gapiLoaded) return;
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const token = user.getAuthResponse().access_token;
      setAccessToken(token);
      setIsSignedIn(true);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!gapi || !gapiLoaded) return;
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setAccessToken(null);
      setIsSignedIn(false);
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const listDriveFiles = async (folderId?: string) => {
    if (!gapi || !accessToken) {
      console.error('GAPI not loaded or no access token');
      return [];
    }
    
    try {
      const allFilesQuery = folderId 
        ? `'${folderId}' in parents and trashed=false`
        : "trashed=false";
      
      console.log('Querying Drive with query:', allFilesQuery);
      
      const response = await gapi.client.drive.files.list({
        q: allFilesQuery,
        fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, size, modifiedTime)',
        pageSize: 100,
      });
      
      console.log('Drive API response:', response);
      const allFiles = response.result.files || [];
      
      const relevantFiles = allFiles.filter((file: any) => {
        const mimeType = file.mimeType?.toLowerCase() || '';
        return mimeType.includes('pdf') || 
               mimeType.includes('text') || 
               mimeType.includes('document') ||
               mimeType.includes('application/vnd.google');
      });
      
      console.log('All files:', allFiles.length);
      console.log('Relevant files:', relevantFiles.length);
      
      return relevantFiles;
    } catch (error: any) {
      console.error('Error listing Drive files:', error);
      console.error('Error details:', error.result?.error);
      return [];
    }
  };

  const getDriveFile = async (fileId: string) => {
    if (!gapi || !accessToken) return null;
    
    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      return response;
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
