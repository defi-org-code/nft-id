// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

import Twitter from 'twitter-lite';
import needle from "needle";

const SECRETS = process.env.REPO_SECRETS_JSON ? JSON.parse(process.env.REPO_SECRETS_JSON) : {};

const client = new Twitter({
  version: "2", // version "1.1" is the default (change for v2)
  extension: false, // true is the default (this must be set to false for v2 endpoints)
  consumer_key: SECRETS.CONSUMER_KEY, // from Twitter.
  consumer_secret: SECRETS.CONSUMER_SECRET, // from Twitter.
  access_token_key: SECRETS.ACCESS_TOKEN_KEY, // from your User (oauth_token)
  access_token_secret: SECRETS.ACCESS_TOKEN_SECRET, // from your User (oauth_token_secret)
});

export const getValidationTweets = async (
  bearerToken: string,
  sinceId?: string
): Promise<any> => {

  // Edit query parameters below
  // specify a search query, and any additional fields that are required
  // by default, only the Tweet ID and text fields are returned
  const params: any = {
    query: `#mynftfyi`,
    max_results: 100,
    "tweet.fields": "entities",
    expansions: "author_id"
  };

  if (sinceId) {
    params.since_id = sinceId;
  }

  try {

    const results:any = await client.get("tweets/search/recent", params);

    if (results.data && results.data.length > 100) {
      console.log("Too many people");
    }

    return {
      max_id_str: results.meta.newest_id,
      tweets: results.data ? results.data.map((result:any) => {
        return {
          id: result.id,
          username: results.includes && results.includes.users ? results.includes.users.find((u:any) => u.id === result.author_id).username : null,
          url: result.entities && result.entities.urls && result.entities.urls.length ? result.entities.urls[0].expanded_url : null
        };
      }) : []
    };

  } catch (e) {
    console.log(e);
  }

};

export const getUserInfo = async (
  bearerToken: string,
  twitterHandle: string
): Promise<Array<any>> => {

  const params: any = {
    screen_name: twitterHandle
  };

  const res = await needle("get", "https://api.twitter.com/1.1/users/lookup.json", params, {
    headers: {
      "User-Agent": "v2RecentSearchJS",
      authorization: `Bearer ${bearerToken}`,
    },
  });

  if (res.body) {
    return res.body;
  } else {
    throw new Error("Unsuccessful request");
  }
};

export const isTweetExist = async (
  bearerToken: string,
  tweetId: string
): Promise<boolean> => {

  const res = await needle("get", `https://api.twitter.com/1.1/statuses/show.json?id=${tweetId}`, null, {
    headers: {
      "User-Agent": "v2RecentSearchJS",
      authorization: `Bearer ${bearerToken}`,
    },
  });

  return res.body && !res.body.errors;
};