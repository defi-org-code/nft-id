// extractNFTImageFromContract - Doron
// extractOwnerFromNFTContract - Doron
// verifySignature - Rotem

export const extractOwnerFromNFTContract = (event: any, context: any) => {
  console.log(event.pathParameters);
  // contract address + tokenId
  return event.pathParameters;
};

export const extractAssetFromNFTContract = (event: any, context: any) => {
  console.log(event.pathParameters);
  // contract address + tokenId
  return event.pathParameters;
};