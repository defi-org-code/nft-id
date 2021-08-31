import { extractOwnerFromNFTContract, verifySignature } from "./web3";
import * as DataAccess from "./data-access";

export const extractContractAddressAndTokenIdFromURL = (_url: string) => {
  const url: any = new URL(_url);
  const parts: Array<string> = url.pathname.substring(1).split("/");
  return {
    tokenId: parts[parts.length - 1],
    contractAddress: parts[parts.length - 2],
  };
};

export const fetchVerifiedRequest = (event: any, context: any) => {
  if (event.queryStringParameters?.openseaUrl) {
    const tokenInfo = extractContractAddressAndTokenIdFromURL(event.queryStringParameters?.openseaUrl);
    return DataAccess.fetchVerifiedRequest(tokenInfo.contractAddress, tokenInfo.tokenId);
  }

  return '';
};

export const createPendingRequest = (event: any, context: any) => {
  const signature = event.queryStringParameters?.signature;
  const json = event.queryStringParameters?.json;
  const tokenInfo = extractContractAddressAndTokenIdFromURL(event.queryStringParameters?.openseaUrl);
  const twitterHandle = JSON.parse(json).twitterHandle;

  const publicKey = verifySignature(signature, json); // Will throw exception if signature not matches json

  if (publicKey === extractOwnerFromNFTContract(event, context)) {
    DataAccess.createPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, signature, json, twitterHandle);
    return "OK";
  }

  return null;
};