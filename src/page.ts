export const viewPage = (event: any, context: any) => {
  console.log(event.pathParameters);
  //event.pathParameters.twitterHandle;
  //event.pathParameters.contractAddress;
  //event.pathParameters.tokenId;
  return event.pathParameters;
};
