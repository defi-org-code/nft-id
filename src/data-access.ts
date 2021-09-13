import path from "path";
import sqlite3, { Database } from "better-sqlite3";
import fs from "fs-extra";

const HOME_DIR = process.env.HOME_DIR!!;
const DB_PATH = path.resolve(HOME_DIR, "nft-id.db");

let db: Database;

export const ensureDBIsReady = () => {
  if (!db) {
    // if (fs.existsSync(DB_PATH)) {
    //   fs.unlinkSync(DB_PATH);
    // }
    // if (!fs.existsSync(HOME_DIR)) {
    //   fs.mkdirsSync(HOME_DIR);
    // }
    db = sqlite3(DB_PATH);

    db.exec(
      `CREATE TABLE IF NOT EXISTS pending_requests (
                  nft_contract_address TEXT, 
                  nft_id TEXT, 
                  signature TEXT, 
                  json TEXT,
                  twitter_handle TEXT,
                  twitter_user_info TEXT,
                  nft_image TEXT,
                  PRIMARY KEY (nft_contract_address, nft_id, twitter_handle)
              )`
    );
    db.exec(
      `CREATE TABLE IF NOT EXISTS verified_requests (
                  nft_contract_address TEXT, 
                  nft_id TEXT, 
                  signature TEXT, 
                  json TEXT,
                  twitter_handle TEXT,
                  tweet_id TEXT,
                  twitter_user_info TEXT,
                  nft_image TEXT,
                  verified_time TEXT,
                  owner_public_key TEXT,
                  PRIMARY KEY (nft_contract_address, nft_id, twitter_handle)
              )`
    );
    db.exec(
      `CREATE TABLE IF NOT EXISTS settings (
                  name TEXT, 
                  value TEXT, 
                  PRIMARY KEY (name)
              )`
    );
  }
};

export const fetchPendingRequest = (contractAddress: string, tokenId: string, twitterHandle: string) => {
  return db
    .prepare(`select * from pending_requests where nft_contract_address = ? and nft_id = ? and twitter_handle = ?`)
    .get(contractAddress, tokenId, twitterHandle);
};

export const fetchVerifiedRequest = (contractAddress: string, tokenId: string) => {
  return db
    .prepare(`select * from verified_requests where nft_contract_address = ? and nft_id = ?`)
    .get(contractAddress, tokenId);
};

export const fetchVerifiedRequestByTwitterHandle = (twitterHandle: string) => {
  return db
    .prepare(`select * from verified_requests where twitter_handle = ?`)
    .get(twitterHandle);
};

export const fetchSetting = (setting: string) => {
  return db
    .prepare(`select * from settings where name = ?`)
    .get(setting);
};

export const upsertSetting = (setting: string, value: string) => {
  const upsertSettingPreparedStatement = db.prepare(
    `Insert INTO settings(name,value) values (?,?)
            ON CONFLICT (name) DO UPDATE SET value = ?`
  );
  upsertSettingPreparedStatement.run(setting, value, value);
};

export const createPendingRequest = (
  contractAddress: string,
  tokenId: string,
  signature: string,
  json: string,
  twitterHandle: string,
  twitterUserInfo: string,
  nftImage: string
) => {
  const pendingRequestPreparedStatement = db.prepare("insert into pending_requests values (?,?,?,?,?,?,?)");
  pendingRequestPreparedStatement.run(
    contractAddress,
    tokenId,
    signature,
    json,
    twitterHandle,
    twitterUserInfo,
    nftImage
  );
};

export const createVerifiedRequest = (
  contractAddress: string,
  tokenId: string,
  signature: string,
  json: string,
  twitterHandle: string,
  twitterUserInfo: string,
  tweetId: string,
  nftImage: string,
  ownerPublicKey: string
) => {
  const verifiedRequestPreparedStatement = db.prepare("insert into verified_requests values (?,?,?,?,?,?,?,?,datetime(),?)");
  verifiedRequestPreparedStatement.run(
    contractAddress,
    tokenId,
    signature,
    json,
    twitterHandle,
    tweetId,
    twitterUserInfo,
    nftImage,
    ownerPublicKey
  );
};

export const deletePreviousPendingRequest = (
  contractAddress: string,
  tokenId: string,
  twitterHandle: string,
) => {
  const deletePendingRequestPreparedStatement = db.prepare("delete from pending_requests where nft_contract_address = ? and nft_id = ? and twitter_handle = ?");
  deletePendingRequestPreparedStatement.run(
    contractAddress,
    tokenId,
    twitterHandle
  );
};

export const deletePreviousVerifiedRequest = (
  twitterHandle: string,
) => {
  const deleteVerifiedRequestPreparedStatement = db.prepare("delete from verified_requests where twitter_handle = ?");
  deleteVerifiedRequestPreparedStatement.run(
    twitterHandle
  );
};

