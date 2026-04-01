import { getAddress } from "viem";

export const APP_ID = "app-001";
export const APP_NAME = "username-claim";
export const CONTRACT_ADDRESS = getAddress("0x0f73d76a61861c2a738a7b374bbddb4d99f84883");

export const usernameAbi = [
  {
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "nameOfUser",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "ownerOfName",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
