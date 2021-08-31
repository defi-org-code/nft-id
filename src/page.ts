import {templateManager} from './pages/hbs-manager';

export async function handler(event: any, context: any): Promise<any> {
  const sqlData = {
    twitterHandle: event.pathParameters.twitterHandle || "elonmusk",
    nftAddress: `${event.pathParameters.contractAddress}/${event.pathParameters.tokenId} "https://opensea.io/assets/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb/659"`,
    nftImage: "https://lh3.googleusercontent.com/Qn6SXNsfH3fgxPdiOvPXxD6qIm04BX2mUGtJvqP-__zYmlbkgS2JEJ9BTikFHl8HXRIsl6t-O2foT0JXXbPyPkfjwxndXFL3vufC1g=s0",
  }

  try {
    const data = {
      _html: {
        lang: 'en'
      },
      isNftRegisterd: true,
      title: `NFT-ID for `,
      message: 'Hello world!',
      env: process.env.NODE_ENV,
      twitterHandle: sqlData.twitterHandle,
      nftAddress: sqlData.nftAddress,
      nftImage: sqlData.nftImage,
    };
    
   
    return Promise.resolve({
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: await templateManager.render(`index`,data) // Apply template with injected data
    });

  } catch (e) {
    throw e;
  //  callback(null, failure({ status: false }, e));
  }
}


export const viewPage = async (event: any, context: any) => {
  console.log(event.pathParameters);
  if (event.pathParameters.secondPathParam) {
    // Fetch with contract and token id
  } else {
    // fetch with twitter handle
  }
  //event.pathParameters.twitterHandle;
  //event.pathParameters.contractAddress;
  //event.pathParameters.tokenId;
  return await handler(event,context);
  //return event.pathParameters;
};
