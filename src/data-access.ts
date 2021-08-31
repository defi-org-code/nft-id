import path from "path";
import sqlite3, { Database } from "better-sqlite3";
import fs from "fs-extra";

const HOME_DIR = process.env.HOME_DIR!!;
const DB_PATH = path.resolve(HOME_DIR, "nft-id.db");

let db: Database;

export const ensureDBIsReady = () => {
  if (!db) {
    fs.unlinkSync(DB_PATH); // TODO: Remove later
    if (!fs.existsSync(HOME_DIR)) {
      fs.mkdirsSync(HOME_DIR);
    }
    db = sqlite3(DB_PATH);

    db.exec(
      `CREATE TABLE IF NOT EXISTS pending_requests (
                  nft_contract_address TEXT, 
                  nft_id TEXT, 
                  signature TEXT, 
                  json TEXT,
                  twitter_handle TEXT,
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
                  twitter_name TEXT,
                  twitter_bio TEXT,
                  verified_time TEXT,
                  PRIMARY KEY (nft_contract_address, nft_id, twitter_handle)
              )`
    );
  }
};

export const fetchVerifiedRequest = (contractAddress: string, tokenId: string) => {
  return db
    .prepare(`select * from verified_requests where nft_contract_address = ? and nft_id = ?`)
    .all(contractAddress, tokenId);
};

export const fetchVerifiedRequestByTwitterHandle = (twitterHandle: string) => {
  return db
    .prepare(`select * from verified_requests where twitter_handle = ?`)
    .get(twitterHandle);
};

export const createPendingRequest = (contractAddress: string, tokenId: string, signature: string, json: string, twitterHandle: string) => {
  const pendingRequestPreparedStatement = db.prepare("insert into pending_requests values (?,?,?,?,?)");
  pendingRequestPreparedStatement.run(
    contractAddress,
    tokenId,
    signature,
    json,
    twitterHandle
  );
};