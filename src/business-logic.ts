import {
  extractAssetFromNFTContractByTokenInfo,
  extractOwnerFromNFTContractByTokenInfo,
  verifySignature
} from "./web3";
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

export const fetchVerifiedRequest = async (event: any, context: any) => {
  let result;
  if (event.queryStringParameters?.url) {
    const tokenInfo = extractContractAddressAndTokenIdFromURL(event.queryStringParameters?.url);
    result = DataAccess.fetchVerifiedRequest(tokenInfo.contractAddress, tokenInfo.tokenId);
  } else if (event.queryStringParameters?.twitterHandle) {
    result = DataAccess.fetchVerifiedRequestByTwitterHandle(event.queryStringParameters.twitterHandle);
  }
  if (!result.nft_image) {
    // Bug, temp fix
    const nftImage = await extractAssetFromNFTContractByTokenInfo({
      tokenId: result.nft_id,
      contractAddress: result.nft_contract_address
    });
    DataAccess.updateVerifyRequest(
      result.nft_contract_address,
      result.nft_id,
      result.twitter_handle,
      nftImage
    );
  }
  return result || {};
};

export const createPendingRequest = async (bearerToken: string, event: any, context: any) => {
  const data = JSON.parse(event.body);
  const signature = data.signature;
  const json = data.json;
  const tokenInfo = extractContractAddressAndTokenIdFromURL(data.openseaUrl);

  if (await verifyNFTOwnership(signature, json, tokenInfo)) {
    const nftImage = await extractAssetFromNFTContractByTokenInfo(tokenInfo);
    if (!nftImage) {
      return null;
    }
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
    if (publicKey === (await extractOwnerFromNFTContractByTokenInfo(tokenInfo, publicKey))) {
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
  const result = await Twitter.getValidationTweets(bearerToken, sinceId);
  const filteredTweets = result.tweets.filter((t:any) => t.id !== sinceId);

  for (const tweet of filteredTweets) {
    try {
      const tokenInfo = extractContractAddressAndTokenIdFromURL(tweet.url);
      const pendingRequest = DataAccess.fetchPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, tweet.username);
      const ownerPublicKey = await verifyNFTOwnership(pendingRequest.signature, pendingRequest.json, tokenInfo);
      if (ownerPublicKey) {
        DataAccess.deletePreviousPendingRequest(tokenInfo.contractAddress, tokenInfo.tokenId, tweet.username);
        DataAccess.deletePreviousVerifiedRequest(tweet.username);
        DataAccess.createVerifiedRequest(
          tokenInfo.contractAddress,
          tokenInfo.tokenId,
          pendingRequest.signature,
          pendingRequest.json,
          pendingRequest.twitter_handle,
          pendingRequest.twitter_user_info,
          tweet.id,
          pendingRequest.nft_image,
          ownerPublicKey
        );
      }
    } catch (ignore) {
    }
  }

  if (filteredTweets.length) {
    DataAccess.upsertSetting('sinceId', result.max_id_str);
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