import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      setResult(`${endpoint}: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    await testApi('/api/dev/clear-db', 'DELETE');
  };

  const getDatabaseStats = async () => {
    await testApi('/api/dev/db-stats');
  };

  const testRegistration = async () => {
    await testApi('/api/auth/register', 'POST', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  };

  const testLogin = async () => {
    await testApi('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Testing Utility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={getDatabaseStats}
                disabled={loading}
                variant="outline"
              >
                DB Stats
              </Button>
              
              <Button 
                onClick={clearDatabase}
                disabled={loading}
                variant="destructive"
              >
                Clear DB
              </Button>
              
              <Button 
                onClick={testRegistration}
                disabled={loading}
                variant="secondary"
              >
                Test Register
              </Button>
              
              <Button 
                onClick={testLogin}
                disabled={loading}
                variant="secondary"
              >
                Test Login
              </Button>
            </div>
            
            {result && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
