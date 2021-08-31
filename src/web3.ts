import Web3 from 'web3';
const web3 = new Web3();
import { extractContractAddressAndTokenIdFromURL } from "./business-logic";

// extractNFTImageFromContract - Doron
// extractOwnerFromNFTContract - Doron
// verifySignature - Rotem

export const extractOwnerFromNFTContract = (event: any, context: any) => {
  console.log(event.pathParameters);
  // contract address + tokenId
  //const tokenInfo = extractContractAddressAndTokenIdFromURL(event.queryStringParameters?.openseaUrl);
  return event.pathParameters;
};

export const extractAssetFromNFTContract = (event: any, context: any) => {
  console.log(event.pathParameters);

  //const tokenInfo = extractContractAddressAndTokenIdFromURL(event.queryStringParameters?.openseaUrl);

  // contract address + tokenId
  return event.pathParameters;
};

export const verifySignature = (signature: string, json: string): string => {
  return web3.eth.accounts.recover(json, signature);
};