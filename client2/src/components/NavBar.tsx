import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Wallet, Bell } from "lucide-react";
import Logo from "./Logo";

export default function NavBar() {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth.on?.("accountsChanged", (accs: string[]) => setAccount(accs?.[0] ?? null));
  }, []);

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return alert("MetaMask not detected");
    const accs = await eth.request({ method: "eth_requestAccounts" });
    setAccount(accs?.[0] ?? null);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <Logo size={22} pulse />
          <span className="brand-text">Axon</span>
        </Link>
        <nav className="links">
          <NavLink to="/explore" className={({isActive}) => isActive ? "link active" : "link"}>Explore</NavLink>
          <NavLink to="/submit" className={({isActive}) => isActive ? "link active" : "link"}>Submit</NavLink>
          <NavLink to="/reviews" className={({isActive}) => isActive ? "link active" : "link"}>Reviews</NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? "link active" : "link"}>Profile</NavLink>
        </nav>
        <div className="right">
          <button className="icon-btn" title="Notifications"><Bell size={18} /></button>
          {account ? (
            <button className="pill" title={account}>
              {account.slice(0,6)}…{account.slice(-4)}
            </button>
          ) : (
            <button className="pill primary" onClick={connect}>
              <Wallet size={16} />&nbsp;Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
