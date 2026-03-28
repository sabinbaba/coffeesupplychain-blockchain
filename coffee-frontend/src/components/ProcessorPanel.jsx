import { useState } from "react";
import { BATCH_STATUS } from "../utils/contract";
import { ethers } from "ethers";

export default function ProcessorPanel({ contract }) {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch]     = useState(null);
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const lookupBatch = async () => {
    if (!batchId) return setStatus("❌ Enter a batch ID.");
    try {
      const b = await contract.getBatch(parseInt(batchId));
      setBatch(b);
      setStatus("");
    } catch (err) {
      setStatus("❌ Batch not found.");
      setBatch(null);
    }
  };

  const sendTx = async (fn, label) => {
    setLoading(true);
    setStatus(`⏳ ${label}...`);
    try {
      const tx = await fn();
      setStatus("⏳ Waiting for confirmation...");
      await tx.wait();
      setStatus(`✅ ${label} successful!`);
      await lookupBatch();
    } catch (err) {
      setStatus(`❌ Error: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>⚙️ Processor Dashboard</h3>
      <p className="panel-desc">
        Look up a batch by ID to process it or list it for sale after inspection.
      </p>
      <div className="form-row">
        <input
          type="number"
          placeholder="Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />
        <button className="btn-secondary" onClick={lookupBatch}>
          Look Up
        </button>
      </div>

      {batch && (
        <div className="batch-detail">
          <p><strong>Origin:</strong> {batch.origin}</p>
          <p><strong>Weight:</strong> {batch.weightKg.toString()} kg</p>
          <p><strong>Price:</strong> {ethers.formatEther(batch.price)} ETH</p>
          <p><strong>Status:</strong>{" "}
            <span className="batch-status">{BATCH_STATUS[Number(batch.status)]}</span>
          </p>

          <div className="action-row">
            {Number(batch.status) === 0 && (
              <button
                className="btn-primary"
                disabled={loading}
                onClick={() => sendTx(() => contract.processBatch(parseInt(batchId)), "Processing batch")}
              >
                {loading ? "Processing..." : "Start Processing"}
              </button>
            )}
            {Number(batch.status) === 2 && (
              <button
                className="btn-primary"
                disabled={loading}
                onClick={() => sendTx(() => contract.listForSale(parseInt(batchId)), "Listing for sale")}
              >
                {loading ? "Listing..." : "List For Sale"}
              </button>
            )}
            {Number(batch.status) !== 0 && Number(batch.status) !== 2 && (
              <p className="muted">No actions available for current status.</p>
            )}
          </div>
        </div>
      )}
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
}
