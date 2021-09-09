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
  beforeRunningFunc.bind(returnFunc.bind(createPendingRequest))
);

export const writer_searchAndVerifyTweets = catchErrors.bind(
  beforeRunningFunc.bind(returnFunc.bind(searchAndVerifyTweets.bind(null, SECRETS.BEARER_TOKEN)))
);

// // ############ WRAPPERS #############

function success(result: any, _continue?: boolean) {
  const response: any = {
    statusCode: result == null ? 500 : 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(result),
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
        "Access-Control-Allow-Origin": "*",
      },
      body: message,
    };
  }
}