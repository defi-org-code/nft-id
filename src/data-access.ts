import path from "path";
import sqlite3, { Database } from "better-sqlite3";
import fs from "fs-extra";

const HOME_DIR = process.env.HOME_DIR!!;
const DB_PATH = path.resolve(HOME_DIR, "nft-id.db");

let db: Database;

export const ensureDBIsReady = () => {
  if (!db) {
    if (fs.existsSync(HOME_DIR)) {
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
                  update_time TEXT,
                  PRIMARY KEY (nft_contract_address, nft_id, twitter_handle)
              )`
    );
  }
};

export const fetchVerifiedRequest = (event: any, context: any) => {
  if (event.queryStringParameters?.openseaUrl) {
    const url: any = new URL(event.queryStringParameters.openseaUrl);
    const parts: Array<string> = url.pathname.substring(1).split("/");
    return `${parts[0]} --- ${parts[1]}`;
  }

  return null;

};
