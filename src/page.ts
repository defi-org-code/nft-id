export const viewPage = (event: any, context: any) => {
  console.log(event.pathParameters);
  if (event.pathParameters.secondPathParam) {
    // Fetch with contract and token id
  } else {
    // fetch with twitter handle
  }
  //event.pathParameters.twitterHandle;
  //event.pathParameters.contractAddress;
  //event.pathParameters.tokenId;
  return event.pathParameters;
};
