require("dotenv").config();
const axios = require("axios");
const { Reshuffle } = require("reshuffle");
const { TwitterConnector } = require("reshuffle-twitter-connector");
const { MondayConnector } = require("reshuffle-monday-connector");

(async () => {
  const app = new Reshuffle();
  const twitter = new TwitterConnector(app, {
    customerKey: process.env.TWITTER_CUSTOMER_KEY,
    customerSecret: process.env.TWITTER_CUSTOMER_SECRET,
  });
  const monday = new MondayConnector(app, { token: process.env.MONDAY_TOKEN });
  const BOARD_ID = 832275321;
  const tweetsCache = {};

  // creates new item on specific board. board ID comes from url in browser
  const createItems = async (tweetInfo) => {
    const column = await monday
      .getColumn(BOARD_ID)
      .then((res) => {
        return res.boards[0].columns.map((col) => {
          return col.id;
        });
      })
      .then(async (col) => {
        const testVars = JSON.stringify({
          [col[1]]: tweetInfo.text,
          [col[2]]: tweetInfo.user.screen_name,
          [col[3]]: {
            date: new Date(Date.parse(tweetInfo.created_at))
              .toISOString()
              .split("T")[0],
          },
        });

        const testQuery = await monday.createItem(
          BOARD_ID,
          JSON.stringify(tweetInfo.id),
          testVars
        );
        console.log(testQuery);
      });
  };

  (async () => {
    const board = await monday.getBoard(BOARD_ID);
    board.boards[0].items.forEach(async (item) => {
      const itemName = await monday.getItem(Number(item.id));
      if (!tweetsCache[Number(itemName.items[0].name)]) {
        tweetsCache[Number(itemName.items[0].name)] = { fetched: true };
      }
    });
  })().catch(console.error);

  twitter.on({ search: "@reshuffleHQ" }, async (event, app) => {
    for (const tweet of event.tweets) {
      if (!tweetsCache[tweet.id]) {
        tweetsCache[tweet.id] = {
          user: tweet.user.screen_name,
          date: tweet.created_at,
          tweet: tweet.text,
        };
        createItems(tweet);
      }
    }
  });

  app.start(8000);
})().catch(console.error);
