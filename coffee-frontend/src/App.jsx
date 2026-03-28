import { useState } from "react";
import { useContract } from "./utils/useContract";
import FarmerPanel    from "./components/FarmerPanel";
import ProcessorPanel from "./components/ProcessorPanel";
import InspectorPanel from "./components/InspectorPanel";
import ConsumerPanel  from "./components/ConsumerPanel";
import AdminPanel     from "./components/AdminPanel";

function App() {
  const {
    contract,
    account,
    role,
    roleName,
    loading,
    error,
    connectWallet,
    refreshRole,
  } = useContract();

  const [showAdmin, setShowAdmin] = useState(false);

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const renderPanel = () => {
    if (!contract || !account) return null;

    if (showAdmin) {
      return (
        <AdminPanel
          contract={contract}
          account={account}
          onRoleAssigned={refreshRole}
        />
      );
    }

    switch (role) {
      case 1: return <FarmerPanel    contract={contract} account={account} />;
      case 2: return <ProcessorPanel contract={contract} account={account} />;
      case 3: return <InspectorPanel contract={contract} account={account} />;
      case 4: return <ConsumerPanel  contract={contract} account={account} />;
      case 0:
      default:
        return (
          <div className="no-role-box">
            <p>⚠️ Your wallet has no role assigned.</p>
            <p>Ask the admin to assign you a role using the Admin panel.</p>
          </div>
        );
    }
  };

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <span className="logo">☕ CoffeeChain</span>
          <span className="subtitle">Blockchain Supply Tracker</span>
        </div>
        <div className="header-right">
          {account ? (
            <div className="wallet-info">
              <span className="role-badge">{roleName}</span>
              <span className="address">{shortAddress(account)}</span>
            </div>
          ) : (
            <button
              className="btn-connect"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      {/* ── Error message ── */}
      {error && <div className="error-banner">❌ {error}</div>}

      {/* ── Main content ── */}
      <main className="main">
        {!account ? (
          <div className="welcome">
            <h1>Welcome to CoffeeChain ☕</h1>
            <p>Connect your MetaMask wallet to get started.</p>
            <p>Make sure you are on the <strong>Sepolia</strong> testnet.</p>
            <button
              className="btn-connect big"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : (
          <div className="panel-wrapper">

            {/* ── Tab navigation ── */}
            <div className="tab-nav">
              <button
                className={`tab-btn ${!showAdmin ? "active" : ""}`}
                onClick={() => setShowAdmin(false)}
              >
                {roleName === "None" ? "My Dashboard" : `${roleName} Dashboard`}
              </button>
              <button
                className={`tab-btn ${showAdmin ? "active" : ""}`}
                onClick={() => setShowAdmin(true)}
              >
                🔑 Admin Panel
              </button>
            </div>

            {/* ── Panel content ── */}
            <div className="panel-header">
              <p className="panel-address">
                Connected as: <code>{account}</code>
              </p>
            </div>

            {renderPanel()}
          </div>
        )}
      </main>

    </div>
  );
}

export default App;