import React, { useState } from 'react';
import { useToken } from '@/context/TokenContext';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TokenDebug: React.FC = () => {
  const { tokenBalance, sendWelcomeTokens, isLoading } = useToken();
  const { account, status } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!account || !tokenBalance) {
      setError('Account or tokenBalance function not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bal = await tokenBalance(account);
      const formatted = (Number(bal) / (10 ** 18)).toFixed(4);
      setBalance(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const claimWelcomeTokens = async () => {
    if (!account || !sendWelcomeTokens) {
      setError('Account or sendWelcomeTokens function not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendWelcomeTokens(account);
      // Refresh balance after claiming
      setTimeout(fetchBalance, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim welcome tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Token Debug Panel</CardTitle>
        <CardDescription>Debug token functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Wallet Status:</strong>
            <Badge variant={status === 'connected' ? 'default' : 'secondary'} className="ml-2">
              {status}
            </Badge>
          </div>
          <div className="text-sm">
            <strong>Account:</strong> {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
          </div>
          <div className="text-sm">
            <strong>Token Context Loading:</strong>
            <Badge variant={isLoading ? 'destructive' : 'default'} className="ml-2">
              {isLoading ? 'Loading' : 'Ready'}
            </Badge>
          </div>
          <div className="text-sm">
            <strong>Token Balance:</strong> {balance} AXON
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={fetchBalance}
            disabled={loading || !account || !tokenBalance}
            variant="outline"
            size="sm"
          >
            {loading ? 'Loading...' : 'Fetch Balance'}
          </Button>
          <Button
            onClick={claimWelcomeTokens}
            disabled={loading || !account || !sendWelcomeTokens}
            size="sm"
          >
            {loading ? 'Loading...' : 'Claim Welcome Tokens'}
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>Functions available:</p>
          <ul className="list-disc list-inside">
            <li>tokenBalance: {!!tokenBalance ? '✅' : '❌'}</li>
            <li>sendWelcomeTokens: {!!sendWelcomeTokens ? '✅' : '❌'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};