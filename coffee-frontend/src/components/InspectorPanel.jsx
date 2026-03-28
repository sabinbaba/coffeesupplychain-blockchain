import { useState, useEffect } from "react";
import { BATCH_STATUS } from "../utils/contract";
import { ethers } from "ethers";

export default function InspectorPanel({ contract, account }) {
  const [batches, setBatches]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [txStatus, setTxStatus] = useState({});

  // ─── Load all batches in "Processing" status ──
  const loadBatches = async () => {
    setLoading(true);
    try {
      const count = await contract.batchCount();
      const total = Number(count);
      const all   = [];

      for (let i = 1; i <= total; i++) {
        const b      = await contract.getBatch(i);
        const status = Number(b.status);
        // Show: Processing (needs inspection) OR
        //       already inspected by this inspector
        if (
          status === 1 ||
          (status >= 2 && b.inspector.toLowerCase() === account.toLowerCase())
        ) {
          all.push(b);
        }
      }
      setBatches(all);
    } catch (err) {
      console.error("Error loading batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBatches(); }, [contract, account]);

  // ─── Inspect a batch ──────────────────────────
  const inspectBatch = async (id) => {
    setTxStatus((prev) => ({ ...prev, [id]: "⏳ Submitting inspection..." }));
    try {
      const tx = await contract.inspectBatch(id);
      setTxStatus((prev) => ({ ...prev, [id]: "⏳ Confirming..." }));
      await tx.wait();
      setTxStatus((prev) => ({ ...prev, [id]: "✅ Batch approved!" }));
      await loadBatches();
    } catch (err) {
      setTxStatus((prev) => ({
        ...prev,
        [id]: `❌ ${err.reason || err.message}`,
      }));
    }
  };

  // ─── Action button per batch status ───────────
  const renderAction = (b) => {
    const id      = Number(b.id);
    const status  = Number(b.status);
    const isMyInspection =
      b.inspector.toLowerCase() === account.toLowerCase();

    if (status === 1) {
      return (
        <button
          className="btn-primary"
          onClick={() => inspectBatch(id)}
        >
          Approve Batch
        </button>
      );
    }

    if (status >= 2 && isMyInspection) {
      return (
        <span className="badge-approved">
          Approved by you
        </span>
      );
    }

    return null;
  };

  return (
    <div className="panel">
      <h3>🔍 Inspector Dashboard</h3>
      <p className="panel-desc">
        Batches waiting for your quality approval, and your previously inspected batches.
      </p>

      <button className="btn-secondary" onClick={loadBatches} disabled={loading}>
        {loading ? "Loading..." : "Refresh Batches"}
      </button>

      {batches.length === 0 && !loading && (
        <p className="muted" style={{ marginTop: "1rem" }}>
          No batches waiting for inspection right now.
        </p>
      )}

      <div className="batch-list">
        {batches.map((b) => {
          const id     = Number(b.id);
          const status = Number(b.status);
          return (
            <div className="batch-card-full" key={id}>
              <div className="batch-card-top">
                <span className="batch-id">Batch #{id}</span>
                <span className={`status-pill status-${status}`}>
                  {BATCH_STATUS[status]}
                </span>
              </div>
              <div className="batch-card-body">
                <p><strong>Origin:</strong> {b.origin}</p>
                <p><strong>Weight:</strong> {b.weightKg.toString()} kg</p>
                <p><strong>Price:</strong> {ethers.formatEther(b.price)} ETH</p>
                <p><strong>Farmer:</strong> <code>{b.farmer.slice(0,8)}...{b.farmer.slice(-6)}</code></p>
                <p><strong>Processor:</strong> <code>{b.processor.slice(0,8)}...{b.processor.slice(-6)}</code></p>
              </div>
              <div className="batch-card-action">
                {renderAction(b)}
                {txStatus[id] && (
                  <p className="status-msg">{txStatus[id]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}