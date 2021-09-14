import { ensureDBIsReady } from "./data-access";
import { extractDataFromNFTContract } from "./web3";
import { createPendingRequest, fetchVerifiedRequest, isTweetExist, searchAndVerifyTweets } from "./business-logic";

const SECRETS = process.env.REPO_SECRETS_JSON ? JSON.parse(process.env.REPO_SECRETS_JSON) : {};

export const reader_fetchVerifiedRequest = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(fetchVerifiedRequest))
);

export const reader_extractDataFromNFTContract = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(extractDataFromNFTContract))
);

export const reader_isTweetExist = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(isTweetExist.bind(null, SECRETS.BEARER_TOKEN)))
);

export const writer_createPendingRequest = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(createPendingRequest.bind(null, SECRETS.BEARER_TOKEN)))
);

export const writer_searchAndVerifyTweets = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(searchAndVerifyTweets.bind(null, SECRETS.BEARER_TOKEN)))
);

// // ############ WRAPPERS #############

function success(result: any, _continue?: boolean) {
  const response: any = {
    statusCode: result == null ? 500 : 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(result)
  };

  if (_continue !== undefined) {
    response.continue = _continue;
  }

  return response;
}

async function returnFunc(this: any, event: any, context: any) {
  const result = await this(event, context);
  return success(result, result && result.continue);
}

async function beforeRunningFunc(this: any, event: any, context: any) {
  await ensureDBIsReady();
  return await this(event, context);
}

async function catchErrors(this: any, event: any, context: any) {
  try {
    return await this(event, context);
  } catch (err) {
    const message = err.stack || err.toString();
    console.error(message);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: message
    };
  }
}

// (async () => {
//
//   console.log(await reader_isTweetExist({
//     pathParameters: {
//       tweetId: "143734819801256755322"
//     }
//   }, {}));
//
// })();

// (async () => {
//
//   const body = JSON.stringify({
//     "signature": "0xef6e6cda1d61e5e4299ea644c012794f23e4415bf65d7d054dbc211115d07ad8638af8fd97a4eca4e0f0290771a285096005966e11d81b819eff7628029387851c",
//     "json": "{\"twitterHandle\":\"mynft_fyi\"}",
//     "openseaUrl": "https://opensea.io/assets/0xbd3531da5cf5857e7cfaa92426877b022e612cf8/5222"
//   });
//
//   console.log(await writer_createPendingRequest({
//     body: body
//   }, {}));
//
// })();
//
// (async () => {
//
//   await writer_searchAndVerifyTweets({}, {});
//
// })();
//
//
// (async () => {
//
//   console.log(await reader_fetchVerifiedRequest({
//     queryStringParameters: {
//       //url: 'https://opensea.io/assets/0x9a604220d37b69c09effcdsdscd2e8475740773e3daf/1650'
//       twitterHandle: 'yakirrsdszdaotem'
//     }
//   }, {}));
//
// })();

// (async () => {
//
//   console.log(await reader_extractDataFromNFTContract({
//     queryStringParameters: {
//       openseaUrl: 'https://opensea.io/assets/0xb9e759022d58f3483ca5e0874f7d4f23a1d0738a/521'
//     }
//   }, {}));
//
// })();


