import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BATCH_STATUS, CONTRACT_ADDRESS, ROLES } from "../utils/contract";

export default function TraceabilityPage({ contract }) {
  const [batchId, setBatchId]   = useState("");
  const [batch, setBatch]       = useState(null);
  const [participantRoles, setParticipantRoles] = useState({});
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError]       = useState("");

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

  const getRoleDisplay = (addr, roleNum) => {
    if (!addr || addr === ethers.ZeroAddress || !roleNum) return "—";
    return `${ROLES[roleNum] || "Unknown"} (${shortAddr(addr)})`;
  };

  useEffect(() => { loadAllBatches(); }, [contract]);

  const searchBatch = async () => {
    if (!batchId) return;
    setSearching(true);
    setError("");
    setBatch(null);
    setParticipantRoles({});
    try {
      const b = await contract.getBatch(parseInt(batchId));
      setBatch(b);
      // Fetch roles for batch participants
      const roles = {};
      if (b.farmer !== ethers.ZeroAddress) {
        roles.farmer = Number(await contract.roles(b.farmer));
      }
      if (b.processor !== ethers.ZeroAddress) {
        roles.processor = Number(await contract.roles(b.processor));
      }
      if (b.inspector !== ethers.ZeroAddress) {
        roles.inspector = Number(await contract.roles(b.inspector));
      }
      if (b.currentOwner !== ethers.ZeroAddress) {
        roles.currentOwner = Number(await contract.roles(b.currentOwner));
      }
      setParticipantRoles(roles);
    } catch {
      setError("Batch not found. Please check the ID.");
    } finally {
      setSearching(false);
    }
  };

  const statusSteps = [
    { label: "Harvested",  icon: "🌱", desc: "Recorded by farmer"     },
    { label: "Processing", icon: "⚙️", desc: "Taken by processor"     },
    { label: "Inspected",  icon: "🔍", desc: "Approved by inspector"  },
    { label: "For Sale",   icon: "🏷️", desc: "Listed on market"       },
    { label: "Sold",       icon: "✅", desc: "Purchased by consumer"  },
  ];

  const formatDate = (ts) => {
    if (!ts || ts.toString() === "0") return "—";
    return new Date(Number(ts) * 1000).toLocaleString();
  };

  const shortAddr = (addr) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "—";
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <div className="trace-page">

      {/* ── Page header ── */}
      <div className="trace-hero">
        <h1>Batch Traceability</h1>
        <p>Track any coffee batch from farm to consumer — fully on-chain and transparent.</p>

        {/* Search bar */}
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

          {/* Batch info header */}
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
            </div>
          </div>

          {/* Journey timeline */}
          <div className="trace-timeline">
            <h3>Supply Chain Journey</h3>
            <div className="timeline">
              {statusSteps.map((step, i) => {
                const currentStatus = Number(batch.status);
                const done    = i <= currentStatus;
                const active  = i === currentStatus;
                return (
                  <div key={i} className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                    <div className="timeline-icon">{step.icon}</div>
                    <div className="timeline-content">
                      <strong>{step.label}</strong>
                      <span>{step.desc}</span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`timeline-connector ${done && i < currentStatus ? "done" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participants */}
          <div className="trace-participants">
            <h3>Participants</h3>
            <div className="participant-grid">
              <div className="participant-card">
                <span className="participant-role teal">🌱 Farmer</span>
                <code>{getRoleDisplay(batch.farmer, participantRoles.farmer)}</code>
                <span className="participant-date">{formatDate(batch.createdAt)}</span>
              </div>
              <div className="participant-card">
                <span className="participant-role purple">⚙️ Processor</span>
                <code>{getRoleDisplay(batch.processor, participantRoles.processor)}</code>
              </div>
              <div className="participant-card">
                <span className="participant-role blue">🔍 Inspector</span>
                <code>{getRoleDisplay(batch.inspector, participantRoles.inspector)}</code>
              </div>
              <div className="participant-card">
                <span className="participant-role coral">👤 Current Owner</span>
                <code>{getRoleDisplay(batch.currentOwner, participantRoles.currentOwner)}</code>
                <span className="participant-date">{formatDate(batch.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="trace-verify">
            <span>🔗 Verify on Etherscan: </span>
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
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
<td><code>{getRoleDisplay(b.farmer, 1)}</code></td>
                    <td className="date-cell">{formatDate(b.createdAt)}</td>
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
