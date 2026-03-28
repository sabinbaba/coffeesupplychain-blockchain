import { useState, useEffect } from "react";
import { BATCH_STATUS } from "../utils/contract";
import { ethers } from "ethers";

export default function ProcessorPanel({ contract, account }) {
  const [batches, setBatches]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [txStatus, setTxStatus] = useState({});

  // ─── Load all batches relevant to processor ───
  const loadBatches = async () => {
    setLoading(true);
    try {
      const count = await contract.batchCount();
      const total = Number(count);
      const all = [];

      for (let i = 1; i <= total; i++) {
        const b = await contract.getBatch(i);
        const status = Number(b.status);
        // Show: Harvested (needs processing) OR
        //       Inspected owned by this processor (needs listing) OR
        //       already processing/listed by this processor
        if (
          status === 0 ||
          (status === 1 && b.processor.toLowerCase() === account.toLowerCase()) ||
          (status === 2 && b.processor.toLowerCase() === account.toLowerCase()) ||
          (status === 3 && b.processor.toLowerCase() === account.toLowerCase())
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

  // ─── Send a transaction and refresh ───────────
  const sendTx = async (batchId, fn, label) => {
    setTxStatus((prev) => ({ ...prev, [batchId]: `⏳ ${label}...` }));
    try {
      const tx = await fn();
      setTxStatus((prev) => ({ ...prev, [batchId]: "⏳ Confirming..." }));
      await tx.wait();
      setTxStatus((prev) => ({ ...prev, [batchId]: `✅ ${label} done!` }));
      await loadBatches();
    } catch (err) {
      setTxStatus((prev) => ({
        ...prev,
        [batchId]: `❌ ${err.reason || err.message}`,
      }));
    }
  };

  // ─── Action button per batch status ───────────
  const renderAction = (b) => {
    const id     = Number(b.id);
    const status = Number(b.status);
    const isMine = b.processor.toLowerCase() === account.toLowerCase();

    if (status === 0) {
      return (
        <button
          className="btn-primary"
          onClick={() =>
            sendTx(id, () => contract.processBatch(id), "Processing batch")
          }
        >
          Start Processing
        </button>
      );
    }

    if (status === 1 && isMine) {
      return (
        <span className="muted">Waiting for inspector approval...</span>
      );
    }

    if (status === 2 && isMine) {
      return (
        <button
          className="btn-primary"
          onClick={() =>
            sendTx(id, () => contract.listForSale(id), "Listing for sale")
          }
        >
          List For Sale
        </button>
      );
    }

    if (status === 3 && isMine) {
      return <span className="badge-listed">Listed for sale</span>;
    }

    return null;
  };

  return (
    <div className="panel">
      <h3>⚙️ Processor Dashboard</h3>
      <p className="panel-desc">
        Batches available to process, and your batches awaiting inspection or listing.
      </p>

      <button className="btn-secondary" onClick={loadBatches} disabled={loading}>
        {loading ? "Loading..." : "Refresh Batches"}
      </button>

      {batches.length === 0 && !loading && (
        <p className="muted" style={{ marginTop: "1rem" }}>
          No batches available right now.
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