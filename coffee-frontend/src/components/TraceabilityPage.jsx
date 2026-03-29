import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BATCH_STATUS, CONTRACT_ADDRESS } from "../utils/contract";

// ─── Helper: get name from localStorage ───────
const getName = (address) => {
  if (!address || address === ethers.ZeroAddress) return null;
  try {
    const users = JSON.parse(localStorage.getItem("coffeechain_users") || "[]");
    const found = users.find(
      (u) => u.address.toLowerCase() === address.toLowerCase()
    );
    return found ? found.name : null;
  } catch {
    return null;
  }
};

export default function TraceabilityPage({ contract }) {
  const [batchId,    setBatchId]    = useState("");
  const [batch,      setBatch]      = useState(null);
  const [allBatches, setAllBatches] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [searching,  setSearching]  = useState(false);
  const [error,      setError]      = useState("");

  // ─── Load all batches ─────────────────────────
  const loadAllBatches = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.batchCount();
      const total = Number(count);
      const list  = [];
      for (let i = 1; i <= total; i++) {
        const b = await contract.getBatch(i);
        list.push(b);
      }
      setAllBatches(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllBatches(); }, [contract]);

  // ─── Search single batch ──────────────────────
  const searchBatch = async () => {
    if (!batchId) return;
    setSearching(true);
    setError("");
    setBatch(null);
    try {
      const b = await contract.getBatch(parseInt(batchId));
      setBatch(b);
    } catch {
      setError("Batch not found. Please check the ID.");
    } finally {
      setSearching(false);
    }
  };

  // ─── Display: name + short address ────────────
  const displayParticipant = (address) => {
    if (!address || address === ethers.ZeroAddress ||
        address === "0x0000000000000000000000000000000000000000") {
      return <span className="not-assigned">Not assigned yet</span>;
    }
    const name = getName(address);
    return (
      <div className="participant-identity">
        {name && <strong className="participant-name">{name}</strong>}
        <code className="participant-addr">
          {address.slice(0, 10)}...{address.slice(-8)}
        </code>
      </div>
    );
  };

  const formatDate = (ts) => {
    if (!ts || ts.toString() === "0") return "—";
    return new Date(Number(ts) * 1000).toLocaleString();
  };

  const shortAddr = (addr) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "—";
    const name = getName(addr);
    return name || `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // ─── Timeline steps with timestamps ───────────
  const getTimelineSteps = (b) => {
    const status = Number(b.status);
    return [
      {
        label:     "Harvested",
        icon:      "🌱",
        desc:      "Recorded by farmer",
        done:      status >= 0,
        active:    status === 0,
        who:       b.farmer,
        timestamp: b.createdAt,
      },
      {
        label:     "Processing",
        icon:      "⚙️",
        desc:      "Taken by processor",
        done:      status >= 1,
        active:    status === 1,
        who:       b.processor,
        timestamp: status >= 1 ? b.updatedAt : null,
      },
      {
        label:     "Inspected",
        icon:      "🔍",
        desc:      "Approved by inspector",
        done:      status >= 2,
        active:    status === 2,
        who:       b.inspector,
        timestamp: status >= 2 ? b.updatedAt : null,
      },
      {
        label:     "For Sale",
        icon:      "🏷️",
        desc:      "Listed on market",
        done:      status >= 3,
        active:    status === 3,
        who:       b.processor,
        timestamp: status >= 3 ? b.updatedAt : null,
      },
      {
        label:     "Sold",
        icon:      "✅",
        desc:      "Purchased by consumer",
        done:      status >= 4,
        active:    status === 4,
        who:       status >= 4 ? b.currentOwner : null,
        timestamp: status >= 4 ? b.updatedAt : null,
      },
    ];
  };

  return (
    <div className="trace-page">

      {/* ── Hero search ── */}
      <div className="trace-hero">
        <h1>Batch Traceability</h1>
        <p>Track any coffee batch from farm to consumer — fully on-chain and transparent.</p>
        <div className="trace-search">
          <input
            type="number"
            placeholder="Enter Batch ID (e.g. 1)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchBatch()}
          />
          <button onClick={searchBatch} disabled={searching}>
            {searching ? "Searching..." : "Track Batch"}
          </button>
        </div>
        {error && <p className="trace-error">{error}</p>}
      </div>

      {/* ── Batch detail ── */}
      {batch && (
        <div className="trace-result">

          {/* Header */}
          <div className="trace-result-header">
            <div>
              <span className="trace-batch-id">Batch #{Number(batch.id)}</span>
              <span className={`trace-status-badge status-${Number(batch.status)}`}>
                {BATCH_STATUS[Number(batch.status)]}
              </span>
            </div>
            <div className="trace-meta">
              <span>📍 {batch.origin}</span>
              <span>⚖️ {batch.weightKg.toString()} kg</span>
              <span>💰 {ethers.formatEther(batch.price)} ETH</span>
              <span>🕐 Created: {formatDate(batch.createdAt)}</span>
              <span>🔄 Updated: {formatDate(batch.updatedAt)}</span>
            </div>
          </div>

          {/* Timeline with names + timestamps */}
          <div className="trace-timeline">
            <h3>Supply Chain Journey</h3>
            <div className="timeline">
              {getTimelineSteps(batch).map((step, i, arr) => (
                <div
                  key={i}
                  className={`timeline-step ${step.done ? "done" : ""} ${step.active ? "active" : ""}`}
                >
                  <div className="timeline-icon">{step.icon}</div>
                  <div className="timeline-content">
                    <strong>{step.label}</strong>
                    <span>{step.desc}</span>
                    {step.done && step.who &&
                      step.who !== "0x0000000000000000000000000000000000000000" && (
                      <span className="timeline-who">
                        {getName(step.who) || `${step.who.slice(0,6)}...`}
                      </span>
                    )}
                    {step.done && step.timestamp &&
                      step.timestamp.toString() !== "0" && (
                      <span className="timeline-time">
                        {formatDate(step.timestamp)}
                      </span>
                    )}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`timeline-connector ${step.done && !step.active ? "done" : ""}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Participants with names */}
          <div className="trace-participants">
            <h3>Participants</h3>
            <div className="participant-grid">
              <div className="participant-card">
                <span className="participant-role teal">🌱 Farmer</span>
                {displayParticipant(batch.farmer)}
                <span className="participant-date">
                  Recorded: {formatDate(batch.createdAt)}
                </span>
              </div>
              <div className="participant-card">
                <span className="participant-role purple">⚙️ Processor</span>
                {displayParticipant(batch.processor)}
              </div>
              <div className="participant-card">
                <span className="participant-role blue">🔍 Inspector</span>
                {displayParticipant(batch.inspector)}
              </div>
              <div className="participant-card">
                <span className="participant-role coral">👤 Current Owner</span>
                {displayParticipant(batch.currentOwner)}
                <span className="participant-date">
                  Last updated: {formatDate(batch.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Etherscan link */}
          <div className="trace-verify">
            <span>🔗 Verify on Etherscan</span>
            
             <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              View Contract →
            </a>
          </div>
        </div>
      )}

      {/* ── All batches table ── */}
      <div className="trace-all">
        <div className="trace-all-header">
          <h3>All Batches on Chain</h3>
          <button className="btn-refresh" onClick={loadAllBatches} disabled={loading}>
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {allBatches.length === 0 && !loading && (
          <p className="muted">No batches recorded yet.</p>
        )}

        {allBatches.length > 0 && (
          <div className="trace-table-wrapper">
            <table className="trace-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Origin</th>
                  <th>Weight</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Farmer</th>
                  <th>Created</th>
                  <th>Last Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allBatches.map((b) => (
                  <tr key={Number(b.id)}>
                    <td><strong>#{Number(b.id)}</strong></td>
                    <td>{b.origin}</td>
                    <td>{b.weightKg.toString()} kg</td>
                    <td>{ethers.formatEther(b.price)} ETH</td>
                    <td>
                      <span className={`status-pill status-${Number(b.status)}`}>
                        {BATCH_STATUS[Number(b.status)]}
                      </span>
                    </td>
                    <td>
                      <div className="table-participant">
                        {getName(b.farmer)
                          ? <strong>{getName(b.farmer)}</strong>
                          : <code>{b.farmer.slice(0,8)}...</code>
                        }
                      </div>
                    </td>
                    <td className="date-cell">{formatDate(b.createdAt)}</td>
                    <td className="date-cell">{formatDate(b.updatedAt)}</td>
                    <td>
                      <button
                        className="btn-track"
                        onClick={() => {
                          setBatchId(Number(b.id).toString());
                          setBatch(b);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}