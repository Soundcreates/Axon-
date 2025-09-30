import { useAuth } from "@/context/AuthContext"
import { useWallet } from "@/context/WalletContext";


export default function useTokenManager() {
  const {user} = useAuth();
  const {account} = useWallet();
  const giveWelcomeToken = async () => {
    if(!user || !account) return;
    if(!user && !account)return;


  } 
}