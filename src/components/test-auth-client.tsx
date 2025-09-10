'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthClient() {
  const [user, setUser] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    checkUser();
    checkProviders();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkProviders = async () => {
    // Supabase가 지원하는 OAuth providers
    const availableProviders = ['google'];
    setProviders(availableProviders);
  };

  const testGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        console.error('OAuth Error:', error);
      } else {
        setMessage('Redirecting to Google...');
        console.log('OAuth Data:', data);
      }
    } catch (err: any) {
      setMessage(`Exception: ${err.message}`);
      console.error('Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(`Logout Error: ${error.message}`);
    } else {
      setMessage('Logged out successfully');
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Auth Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Environment:</h3>
              <p className="text-sm">Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p className="text-sm">Callback URL: {window.location.origin}/auth/callback</p>
            </div>

            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Current User:</h3>
              {user ? (
                <div className="text-sm">
                  <p>Email: {user.email}</p>
                  <p>ID: {user.id}</p>
                  <p>Provider: {user.app_metadata?.provider}</p>
                </div>
              ) : (
                <p className="text-sm">Not logged in</p>
              )}
            </div>

            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-semibold mb-2">Available Providers:</h3>
              <ul className="text-sm">
                {providers.map(p => (
                  <li key={p}>✅ {p}</li>
                ))}
              </ul>
            </div>

            {message && (
              <div className={`p-4 rounded ${message.includes('Error') ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="flex gap-4">
              {!user ? (
                <Button 
                  onClick={testGoogleLogin}
                  disabled={loading || authLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {(loading || authLoading) ? 'Loading...' : 'Test Google Login'}
                </Button>
              ) : (
                <Button 
                  onClick={testLogout}
                  variant="outline"
                >
                  Logout
                </Button>
              )}
            </div>

            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <p className="text-xs font-mono">
                Check browser console for detailed logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}