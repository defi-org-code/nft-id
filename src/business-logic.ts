import { extractAssetFromNFTContract, extractOwnerFromNFTContractByTokenInfo, verifySignature } from "./web3";
import * as DataAccess from "./data-access";
import * as Twitter from "./twitter-api";

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

export const createPendingRequest = async (event: any, context: any) => {
  const data = JSON.parse(event.body);
  const signature = data.signature;
  const json = data.json;
  console.log("data", data);
  const tokenInfo = extractContractAddressAndTokenIdFromURL(data.openseaUrl);

  if (await verifyNFTOwnership(signature, json, tokenInfo)) {
    const nftImage = await extractAssetFromNFTContract(event, context);
    const twitterHandle = JSON.parse(json).twitterHandle;
    DataAccess.createPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, signature, json, twitterHandle, nftImage);
    return "OK";
  }

  return null;
};

export const verifyNFTOwnership = async (signature: string, json: string, tokenInfo: any): Promise<string | null> => {
  try {
    const publicKey = verifySignature(signature, json); // Will throw exception if signature not matches json
    if (publicKey === (await extractOwnerFromNFTContractByTokenInfo(tokenInfo))) {
      return publicKey;
    }
  } catch (ignore) {
  }
  return null;
};

export const searchAndVerifyTweets = async (bearerToken: string, event: any, context: any) => {
  const sinceId = DataAccess.fetchSetting('sinceId')?.value;
  const tweets = await Twitter.getValidationTweets(bearerToken, sinceId);
  const filteredTweets = tweets.statuses.filter(t => t.id_str !== sinceId);

  for (const tweet of filteredTweets) {
    try {
      const tokenInfo = extractContractAddressAndTokenIdFromURL(tweet.entities.urls[0].expanded_url);
      const pendingRequest = DataAccess.fetchPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, tweet.user.screen_name);
      const ownerPublicKey = await verifyNFTOwnership(pendingRequest.signature, pendingRequest.json, tokenInfo);
      if (ownerPublicKey) {
        DataAccess.deletePreviousPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, tweet.user.screen_name);
        DataAccess.deletePreviousVerifiedRequest(tweet.user.screen_name);
        DataAccess.createVerifiedRequest(
          tokenInfo.contractAddress,
          tokenInfo.tokenId,
          pendingRequest.signature,
          pendingRequest.json,
          pendingRequest.twitter_handle,
          tweet.id_str,
          tweet.user.screen_name,
          tweet.user.description,
          pendingRequest.nft_image,
          ownerPublicKey
        );
      }
    } catch (ignore) {
    }
  }

  if (tweets.statuses.length) {
    DataAccess.upsertSetting('sinceId', tweets.statuses[0].id_str);
  }

  return 'OK';
};