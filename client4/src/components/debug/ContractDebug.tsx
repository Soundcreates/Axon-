import { useContracts } from '@/context/ContractContext';
import { useWallet } from '@/context/WalletContext';

//THIS FILE is SOLELY FOR DEBUGGING PURPOSES ESPECIALLY FOR CONTRACTS (type shi, this will be removed during prod i hope)

export const ContractDebug = () => {
  const {
    peerReviewContract,
    axonTokenContract,
    isLoading,
    error,
    peerReview_submitManuscript
  } = useContracts();
  const { status, account, provider, signer } = useWallet();

  return (
    <div className="p-4 bg-gray-100 rounded border-2 border-red-200 mb-4">
      <h3 className="font-bold text-lg mb-2">🔧 Contract Debug Info</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold">Wallet Status:</h4>
          <p>Status: <span className={`font-mono ${status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{status}</span></p>
          <p>Account: <span className="font-mono">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'None'}</span></p>
          <p>Provider: <span className={`font-mono ${provider ? 'text-green-600' : 'text-red-600'}`}>{provider ? 'Available' : 'None'}</span></p>
          <p>Signer: <span className={`font-mono ${signer ? 'text-green-600' : 'text-red-600'}`}>{signer ? 'Available' : 'None'}</span></p>
        </div>
        <div>
          <h4 className="font-semibold">Contract Status:</h4>
          <p>Loading: <span className={`font-mono ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>{isLoading ? 'Yes' : 'No'}</span></p>
          <p>Error: <span className={`font-mono ${error ? 'text-red-600' : 'text-green-600'}`}>{error || 'None'}</span></p>
          <p>PeerReview: <span className={`font-mono ${peerReviewContract ? 'text-green-600' : 'text-red-600'}`}>{peerReviewContract ? 'Available' : 'None'}</span></p>
          <p>AxonToken: <span className={`font-mono ${axonTokenContract ? 'text-green-600' : 'text-red-600'}`}>{axonTokenContract ? 'Available' : 'None'}</span></p>
          <p>Submit Function: <span className={`font-mono ${peerReview_submitManuscript ? 'text-green-600' : 'text-red-600'}`}>{peerReview_submitManuscript ? 'Available' : 'None'}</span></p>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700 text-xs font-mono">{error}</p>
        </div>
      )}
    </div>
  );
};