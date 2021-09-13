import { ensureDBIsReady } from "./data-access";
import { extractDataFromNFTContract } from "./web3";
import { createPendingRequest, fetchVerifiedRequest, searchAndVerifyTweets } from "./business-logic";

const SECRETS = process.env.REPO_SECRETS_JSON ? JSON.parse(process.env.REPO_SECRETS_JSON) : {};

export const reader_fetchVerifiedRequest = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(fetchVerifiedRequest))
);

export const reader_extractDataFromNFTContract = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(extractDataFromNFTContract))
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

// TODO: Fetch if tweet exist or not

// (async () => {
//
//   const body = JSON.stringify({
//     "signature": "0xff7480f14a77ba0ba162856f804dc361a9c00ca0aeeb77f73bd8ae8c0b4966b07c26611adf3ebab9f7c2c6d588a5e38e811fb734b8466b50c1ed3893ffdb1b331b",
//     "json": "{\"twitterHandle\":\"yakirrotem\"}",
//     "openseaUrl": "https://opensea.io/assets/0x9a604220d37b69c09effccd2e8475740773e3daf/1650"
//   });
//
//   console.log(await writer_createPendingRequest({
//     body: body
//   }, {}));
//
// })();

// (async () => {
//
//   await writer_searchAndVerifyTweets({}, {});
//
// })();

//
// (async () => {
//
//   console.log(await reader_fetchVerifiedRequest({
//     queryStringParameters: {
//       url: 'https://opensea.io/assets/0x9a604220d37b69c09effccd2e8475740773e3daf/1650'
//     }
//   }, {}));
//
// })();


