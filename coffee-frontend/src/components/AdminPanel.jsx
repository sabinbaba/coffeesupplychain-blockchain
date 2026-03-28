import { useState, useEffect } from "react";
import { ROLES } from "../utils/contract";

export default function AdminPanel({ contract, onRoleAssigned }) {
  const [address, setAddress]         = useState("");
  const [name, setName]               = useState("");
  const [selectedRole, setSelectedRole] = useState("1");
  const [status, setStatus]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [users, setUsers]             = useState([]);

  // ─── Load saved users from localStorage ───────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("coffeechain_users") || "[]");
    setUsers(saved);
  }, []);

  // ─── Save users to localStorage ───────────────
  const saveUser = (newUser) => {
    const saved = JSON.parse(localStorage.getItem("coffeechain_users") || "[]");
    // Update if address already exists, otherwise add
    const exists = saved.findIndex(
      (u) => u.address.toLowerCase() === newUser.address.toLowerCase()
    );
    if (exists >= 0) {
      saved[exists] = newUser;
    } else {
      saved.push(newUser);
    }
    localStorage.setItem("coffeechain_users", JSON.stringify(saved));
    setUsers(saved);
  };

  // ─── Assign role on blockchain + save name ────
  const assignRole = async () => {
    if (!address) return setStatus("❌ Please enter a wallet address.");
    if (!name)    return setStatus("❌ Please enter a name for this user.");

    setLoading(true);
    setStatus("⏳ Sending transaction...");
    try {
      const tx = await contract.assignRole(address, parseInt(selectedRole));
      setStatus("⏳ Waiting for confirmation...");
      await tx.wait();

      // Save name + address + role locally
      saveUser({
        name,
        address,
        role: parseInt(selectedRole),
        roleName: ROLES[selectedRole],
        assignedAt: new Date().toLocaleString(),
      });

      setStatus(`✅ "${name}" assigned as ${ROLES[selectedRole]} successfully!`);
      setAddress("");
      setName("");
      if (onRoleAssigned) onRoleAssigned();
    } catch (err) {
      setStatus(`❌ Error: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── Remove user from local list ──────────────
  const removeUser = (addr) => {
    const saved = JSON.parse(localStorage.getItem("coffeechain_users") || "[]");
    const updated = saved.filter(
      (u) => u.address.toLowerCase() !== addr.toLowerCase()
    );
    localStorage.setItem("coffeechain_users", JSON.stringify(updated));
    setUsers(updated);
  };

  return (
    <div className="panel">
      <h3>🔑 Admin — Assign Role</h3>
      <p className="panel-desc">
        Assign a role to any wallet address. Names are saved locally for easy tracking.
      </p>

      {/* ── Form ── */}
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          placeholder="e.g. Jean Paul Mugisha"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Wallet Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="1">🌱 Farmer</option>
          <option value="2">⚙️ Processor</option>
          <option value="3">🔍 Inspector</option>
          <option value="4">🛒 Consumer</option>
        </select>
      </div>

      <button className="btn-primary" onClick={assignRole} disabled={loading}>
        {loading ? "Assigning..." : "Assign Role"}
      </button>

      {status && <p className="status-msg">{status}</p>}

      {/* ── Registered users table ── */}
      {users.length > 0 && (
        <div className="users-table-wrapper">
          <h4>Registered Users ({users.length})</h4>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Role</th>
                <th>Assigned</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.address}>
                  <td className="user-name">{u.name}</td>
                  <td>
                    <code>{u.address.slice(0, 8)}...{u.address.slice(-6)}</code>
                  </td>
                  <td>
                    <span className={`role-pill role-${u.role}`}>
                      {u.roleName}
                    </span>
                  </td>
                  <td className="assigned-at">{u.assignedAt}</td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() => removeUser(u.address)}
                      title="Remove from list"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}