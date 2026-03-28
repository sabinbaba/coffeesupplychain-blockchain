import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BATCH_STATUS } from "../utils/contract";

export default function FarmerPanel({ contract, account }) {
  const [origin, setOrigin]   = useState("");
  const [weight, setWeight]   = useState("");
  const [price, setPrice]     = useState("");
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);

  const loadBatches = async () => {
    try {
      const ids = await contract.getBatchesByOwner(account);
      const loaded = await Promise.all(ids.map((id) => contract.getBatch(id)));
      setBatches(loaded);
    } catch (err) {
      console.error("Error loading batches:", err);
    }
  };

  useEffect(() => { loadBatches(); }, [contract, account]);

  const createBatch = async () => {
    if (!origin || !weight || !price)
      return setStatus("❌ Please fill in all fields.");
    setLoading(true);
    setStatus("⏳ Sending transaction...");
    try {
      const priceWei = ethers.parseEther(price);
      const tx = await contract.createBatch(origin, parseInt(weight), priceWei);
      setStatus("⏳ Waiting for confirmation...");
      await tx.wait();
      setStatus("✅ Batch created successfully!");
      setOrigin(""); setWeight(""); setPrice("");
      loadBatches();
    } catch (err) {
      setStatus(`❌ Error: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>🌱 Farmer — Create Coffee Batch</h3>
      <p className="panel-desc">
        Record a new coffee harvest on the blockchain.
      </p>
      <div className="form-group">
        <label>Origin (farm location)</label>
        <input
          type="text"
          placeholder="e.g. Kigali, Rwanda"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Weight (kg)</label>
        <input
          type="number"
          placeholder="e.g. 100"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Price (ETH)</label>
        <input
          type="number"
          placeholder="e.g. 0.01"
          step="0.001"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <button className="btn-primary" onClick={createBatch} disabled={loading}>
        {loading ? "Creating..." : "Create Batch"}
      </button>
      {status && <p className="status-msg">{status}</p>}

      {batches.length > 0 && (
        <div className="batch-list">
          <h4>Your Batches</h4>
          {batches.map((b) => (
            <div className="batch-card" key={b.id.toString()}>
              <span className="batch-id">Batch #{b.id.toString()}</span>
              <span>{b.origin}</span>
              <span>{b.weightKg.toString()} kg</span>
              <span className="batch-status">{BATCH_STATUS[Number(b.status)]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
