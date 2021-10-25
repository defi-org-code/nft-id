import needle from "needle";
import * as fs from "fs";
import * as http from "http";

const bearerToken = "AAAAAAAAAAAAAAAAAAAAAAyaTgEAAAAASWuYi1ZOaRFfRsTCTxB3X6G1bJ4%3DIHbB8k0t2RK42at2z1VHkIVslFmpXsjkKBvr0luLAkUWJdoQym";
const createCertificate = require("./create-certificate.js");

async function saveUser(user: any) {

  const profileImage = user["profile_image_url"];
  const name = user["name"];
  const screen_name = user["screen_name"];

  const downloadedFile = await downloadImage(screen_name, profileImage);

  await createCertificate(name, screen_name, downloadedFile);
}

async function downloadImage(name: string, url: string): Promise<string> {
  let file = `imgs/${name}.png`;
  url = url.replace("_normal", "");
  const p = new Promise(async (resolve, reject) => {
    try {
      const fileStream = fs.createWriteStream(file);
      http.get(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        }
      }, function(response) {
        response.pipe(fileStream);
        fileStream.on('finish', function() {
          fileStream.close();
          resolve(true);
        });
      });
    } catch (e) {
      console.log(e);
    }
  });
  await p;
  return file;
}

async function _usersMeta(screen_names: string[]) {
  let users = screen_names.join(",");
  let url = `https://api.twitter.com/1.1/users/lookup.json?include_entities=false`;

  const res = await needle("get", url,
    {
      screen_name: users
    }
    , {
      headers: {
        "User-Agent": "v2RecentSearchJS",
        authorization: `Bearer ${bearerToken}`
      }
    });
  return res;
}

function readCSV(): string[] {
  let users = fs.readFileSync("./users.csv", "utf-8");
  return users.split("\n");
}

const BATCH_SIZE = 100;

async function iteratingToUserIds() {

  let users = readCSV();

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    console.log("Going over batch", i);
    let subArray = users.slice(i, BATCH_SIZE + i);
    let res = await _usersMeta(subArray);
    for (const user of res.body) {
      console.log("going over user", user.screen_name);
      try {
        await saveUser(user);
      } catch (e) {
        console.log("Failed to fetch ", user.screen_name, e);
      }
    }
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

(async () => {

  await iteratingToUserIds();
})();


