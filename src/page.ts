import {templateManager} from './pages/hbs-manager';

export async function pageHandler(event: any, context: any): Promise<any> {
  
  try {
  //TODO integrate sqlite
  let assetUrl = '';
  if(event.pathParameters.tokenId && event.pathParameters.contractAddress) {
    assetUrl = `https://opensea.io/assets/${event.pathParameters.contractAddress}/${event.pathParameters.tokenId}`
  }
    const sqlData = {
      twitterHandle: event.pathParameters.twitterHandle,
      nftAddress:  assetUrl,
      nftImage: 'https://lh3.googleusercontent.com/Qn6SXNsfH3fgxPdiOvPXxD6qIm04BX2mUGtJvqP-__zYmlbkgS2JEJ9BTikFHl8HXRIsl6t-O2foT0JXXbPyPkfjwxndXFL3vufC1g=s0',
      owner: '0x86BCD965dFd3DE8d3B1D6bb856Ac6f6Bf657732A',
      signature: '',
      signedData: ''
    }
    
    let isNftRegisterd = sqlData?.signature.length > 0;
    isNftRegisterd = false;
  
    const defaultData = {
      _html: {
        lang: 'en'
      },
      isNftRegisterd: isNftRegisterd,
      title: `NFT-ID for `,
      message: 'Hello world!',
      env: process.env.NODE_ENV,
      twitterHandle: sqlData.twitterHandle,
      nftAddress: sqlData.nftAddress,
      nftImage: sqlData.nftImage,
      owner: sqlData.owner,
      signature: sqlData.signature,
      signedData: sqlData.signedData,
    };

    let data = Object.assign({}, defaultData, sqlData);
    
   
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
    event.pathParameters.tokenId = event.pathParameters.secondPathParam;
    event.pathParameters.contractAddress = event.pathParameters.firstPathParam;
    // Fetch with contract and token id
  } else {
    event.pathParameters.twitterHandle = event.pathParameters.firstPathParam;
  }
  //event.pathParameters.twitterHandle;
  //event.pathParameters.contractAddress;
  //event.pathParameters.tokenId;
  return await pageHandler(event,context);
  //return event.pathParameters;
};
