// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

import needle from "needle";
import { RecentResults, UserResponse } from "./types";

export const getValidationTweets = async (
  bearerToken: string,
  sinceId?: string
): Promise<RecentResults> => {

  // Edit query parameters below
  // specify a search query, and any additional fields that are required
  // by default, only the Tweet ID and text fields are returned
  const params: any = {
    q: `#mynftfyi`,
    result_type: "recent",
    include_entities: true,
    tweet_mode: "extended",
    count: 100,
  };

  if (sinceId) {
    params.since_id = sinceId;
  }

  const res = await needle("get", "https://api.twitter.com/1.1/search/tweets.json", params, {
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