import {
  extractAssetFromNFTContractByTokenInfo,
  extractOwnerFromNFTContractByTokenInfo,
  verifySignature
} from "./web3";
import * as DataAccess from "./data-access";
import * as Twitter from "./twitter-api";
import { UserInfo } from "os";

export const extractContractAddressAndTokenIdFromURL = (_url: string) => {
  const url: any = new URL(_url);
  const parts: Array<string> = url.pathname.substring(1).split("/");
  return {
    tokenId: parts[parts.length - 1],
    contractAddress: parts[parts.length - 2],
  };
};

export const fetchVerifiedRequest = (event: any, context: any) => {
  if (event.queryStringParameters?.url) {
    const tokenInfo = extractContractAddressAndTokenIdFromURL(event.queryStringParameters?.url);
    return DataAccess.fetchVerifiedRequest(tokenInfo.contractAddress, tokenInfo.tokenId);
  } else if (event.queryStringParameters?.twitterHandle) {
    return DataAccess.fetchVerifiedRequestByTwitterHandle(event.queryStringParameters.twitterHandle);
  }

  return '';
};

export const createPendingRequest = async (bearerToken: string, event: any, context: any) => {
  const data = JSON.parse(event.body);
  const signature = data.signature;
  const json = data.json;
  const tokenInfo = extractContractAddressAndTokenIdFromURL(data.openseaUrl);

  if (await verifyNFTOwnership(signature, json, tokenInfo)) {
    const nftImage = await extractAssetFromNFTContractByTokenInfo(tokenInfo);
    const twitterHandle = JSON.parse(json).twitterHandle;
    const userTwitterInfo = (await Twitter.getUserInfo(bearerToken, twitterHandle)).map(user => {
      return {
        profile_banner_url: user.profile_banner_url,
        friends_count: user.friends_count,
        followers_count: user.followers_count,
        name: user.name,
        create_at: user.create_at,
        description: user.description,
        verified: user.verified,
        profile_background_color: user.profile_background_color,
      };
    })[0];
    DataAccess.deletePreviousPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, twitterHandle);
    DataAccess.createPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, signature, json, twitterHandle, JSON.stringify(userTwitterInfo), nftImage);
    return userTwitterInfo;
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

  let currentRun = 0;
  if (event["taskresult"]) {
    const previousResult = JSON.parse(event["taskresult"].body);
    currentRun = previousResult.currentRun || 0;
  }

  console.log("Running ", currentRun);

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
          pendingRequest.twitter_user_info,
          tweet.id_str,
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

  return {
    result: 'OK',
    currentRun: currentRun + 1,
    continue: currentRun < 6
  };
};

export const isTweetExist = async (bearerToken: string, event: any, context: any) => {
  const tweetId = event.pathParameters.tweetId;
  const result = await Twitter.isTweetExist(bearerToken, tweetId);
  return {
    result
  }
};