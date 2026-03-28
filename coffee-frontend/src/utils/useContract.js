import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS, ROLES } from "./contract";

export function useContract() {
  const [provider, setProvider]   = useState(null);
  const [signer, setSigner]       = useState(null);
  const [contract, setContract]   = useState(null);
  const [account, setAccount]     = useState(null);
  const [role, setRole]           = useState(null);
  const [roleName, setRoleName]   = useState("None");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // ─── Fetch role from blockchain ───────────────
  const fetchRole = useCallback(async (contractInstance, address) => {
    try {
      const roleNumber = await contractInstance.roles(address);
      const num = Number(roleNumber);
      setRole(num);
      setRoleName(ROLES[num] || "None");
    } catch (err) {
      console.error("Error fetching role:", err);
    }
  }, []);

  // ─── Connect wallet ───────────────────────────
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check MetaMask exists
      if (!window.ethereum) {
        throw new Error("MetaMask not found. Please install it.");
      }

      // Request wallet access
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);

      // Check we're on Sepolia (chainId 11155111)
      const network = await web3Provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error("Please switch MetaMask to the Sepolia network.");
      }

      const web3Signer = await web3Provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(accounts[0]);

      // Fetch this wallet's role from blockchain
      await fetchRole(contractInstance, accounts[0]);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchRole]);

  // ─── Auto-reconnect if already connected ──────
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.listAccounts();

      if (accounts.length > 0) {
        await connectWallet();
      }
    };
    autoConnect();
  }, [connectWallet]);

  // ─── Listen for account/network changes ───────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountChange = () => connectWallet();
    const handleChainChange   = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountChange);
    window.ethereum.on("chainChanged",    handleChainChange);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
      window.ethereum.removeListener("chainChanged",    handleChainChange);
    };
  }, [connectWallet]);

  // ─── Refresh role (called after transactions) ─
  const refreshRole = useCallback(async () => {
    if (contract && account) {
      await fetchRole(contract, account);
    }
  }, [contract, account, fetchRole]);

  return {
    provider,
    signer,
    contract,
    account,
    role,
    roleName,
    loading,
    error,
    connectWallet,
    refreshRole,
  };
}
