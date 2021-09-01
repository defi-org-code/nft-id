import { templateManager } from "./pages/hbs-manager";
import * as DataAccess from "./data-access";

export const viewNFTPage = async (event: any, context: any) => {
  console.log(event.pathParameters);
  if (event.pathParameters.secondPathParam) {
    // Fetch with contract and token id
    return await viewNFTPageHandler(event.pathParameters.firstPathParam, event.pathParameters.secondPathParam);

  } else {
    // Fetch with twitter handle
    return await viewNFTPageHandler(event.pathParameters.firstPathParam);
  }

};

export const viewRegisterPage = async (event: any, context: any) => {
  return Promise.resolve({
    statusCode: 200,
    headers: {
      "Content-Type": "text/html"
    },
    body: await templateManager.render(`register-page`, {}) // Apply template with injected data
  });
};

export async function viewNFTPageHandler(contractAddress?: string, tokenId?: string, twitterHandle?: string): Promise<any> {

  try {

    const sqlData = twitterHandle ?
      DataAccess.fetchVerifiedRequestByTwitterHandle(twitterHandle) :
      DataAccess.fetchVerifiedRequest(contractAddress!!, tokenId!!);

    let isNFTVerified = !sqlData;

    const defaultData = {
      _html: {
        lang: "en"
      },
      isNFTVerified: isNFTVerified,
      title: `NFT-ID for `,
    };

    let data = Object.assign({}, defaultData, sqlData);

    return Promise.resolve({
      statusCode: 200,
      headers: {
        "Content-Type": "text/html"
      },
      body: await templateManager.render(`nft-page`, data) // Apply template with injected data
    });

  } catch (e) {
    throw e;
  }
}