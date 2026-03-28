import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BATCH_STATUS } from "../utils/contract";

export default function ConsumerPanel({ contract }) {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch]     = useState(null);
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount]     = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const c = await contract.batchCount();
        setCount(Number(c));
      } catch {}
    };
    loadCount();
  }, [contract]);

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

  const buyBatch = async () => {
    setLoading(true);
    setStatus("⏳ Sending payment...");
    try {
      const tx = await contract.buyBatch(parseInt(batchId), {
        value: batch.price,
      });
      setStatus("⏳ Waiting for confirmation...");
      await tx.wait();
      setStatus("✅ Purchase complete! You now own this batch.");
      await lookupBatch();
    } catch (err) {
      setStatus(`❌ Error: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>🛒 Consumer Dashboard</h3>
      <p className="panel-desc">
        Look up a batch by ID to view its details and buy it.
        There are currently <strong>{count}</strong> batch(es) on chain.
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

          {Number(batch.status) === 3 ? (
            <button
              className="btn-primary"
              onClick={buyBatch}
              disabled={loading}
            >
              {loading ? "Buying..." : `Buy for ${ethers.formatEther(batch.price)} ETH`}
            </button>
          ) : (
            <p className="muted">This batch is not for sale.</p>
          )}
        </div>
      )}
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
}
