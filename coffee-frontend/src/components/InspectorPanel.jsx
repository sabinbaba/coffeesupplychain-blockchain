import { useState } from "react";
import { BATCH_STATUS } from "../utils/contract";
import { ethers } from "ethers";

export default function InspectorPanel({ contract }) {
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

  const inspectBatch = async () => {
    setLoading(true);
    setStatus("⏳ Submitting inspection...");
    try {
      const tx = await contract.inspectBatch(parseInt(batchId));
      setStatus("⏳ Waiting for confirmation...");
      await tx.wait();
      setStatus("✅ Batch approved successfully!");
      await lookupBatch();
    } catch (err) {
      setStatus(`❌ Error: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>🔍 Inspector Dashboard</h3>
      <p className="panel-desc">
        Look up a batch in "Processing" status and approve it after quality check.
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
          <p><strong>Farmer:</strong> <code>{batch.farmer}</code></p>
          <p><strong>Status:</strong>{" "}
            <span className="batch-status">{BATCH_STATUS[Number(batch.status)]}</span>
          </p>

          {Number(batch.status) === 1 ? (
            <button
              className="btn-primary"
              onClick={inspectBatch}
              disabled={loading}
            >
              {loading ? "Approving..." : "✅ Approve Batch"}
            </button>
          ) : (
            <p className="muted">
              This batch is not in "Processing" status — nothing to inspect.
            </p>
          )}
        </div>
      )}
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
}
