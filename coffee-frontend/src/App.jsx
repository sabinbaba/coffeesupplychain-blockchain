import { useState, useEffect } from "react";
import { useContract } from "./utils/useContract";
import FarmerPanel     from "./components/FarmerPanel";
import ProcessorPanel  from "./components/ProcessorPanel";
import InspectorPanel  from "./components/InspectorPanel";
import ConsumerPanel   from "./components/ConsumerPanel";
import AdminPanel      from "./components/AdminPanel";
import TraceabilityPage from "./components/TraceabilityPage";
import Layout          from "./components/Layout";

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

  const [isAdmin, setIsAdmin]       = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // ─── Check if connected wallet is the admin ───
  useEffect(() => {
    const checkAdmin = async () => {
      if (!contract || !account) return;
      try {
        const adminAddress = await contract.admin();
        setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
      } catch (err) {
        console.error("Error checking admin:", err);
      }
    };
    checkAdmin();
  }, [contract, account]);

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const renderDashboard = () => {
    if (isAdmin) {
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
          <div className="onboarding">
            <div className="onboarding-icon">⚠️</div>
            <h3>No Role Assigned Yet</h3>
            <p>Your wallet is connected but you don't have a role in this system.</p>
            <div className="onboarding-steps">
              <div className="onboarding-step">
                <span className="step-num">1</span>
                <div>
                  <strong>Copy your wallet address</strong>
                  <p>Your address: <code>{account}</code></p>
                </div>
              </div>
              <div className="onboarding-step">
                <span className="step-num">2</span>
                <div>
                  <strong>Send it to the admin</strong>
                  <p>The admin will assign you a role — Farmer, Processor, Inspector, or Consumer.</p>
                </div>
              </div>
              <div className="onboarding-step">
                <span className="step-num">3</span>
                <div>
                  <strong>Refresh this page</strong>
                  <p>Once assigned, refresh and your dashboard will appear automatically.</p>
                </div>
              </div>
            </div>
            <button
              className="btn-copy"
              onClick={() => {
                navigator.clipboard.writeText(account);
                alert("Address copied to clipboard!");
              }}
            >
              Copy My Wallet Address
            </button>
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

      {!account ? (
        <div className="welcome-screen">
          <div className="welcome-card">
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
        </div>
      ) : (
        <Layout
          account={account}
          roleName={roleName}
          isAdmin={isAdmin}
          activePage={activePage}
          setActivePage={setActivePage}
        >
          {activePage === "dashboard" && renderDashboard()}
          {activePage === "trace" && <TraceabilityPage contract={contract} />}
{activePage === "admin" && isAdmin && <AdminPanel contract={contract} account={account} onRoleAssigned={refreshRole} />}
        </Layout>
      )}

    </div>
  );
}

export default App;
