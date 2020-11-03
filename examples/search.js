require("dotenv").config();
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
  const createItems = async (tweetId) => {
    const board = await monday.createItem(BOARD_ID, tweetId);
  };

  const getBoardItems = async () => {
    const board = await monday.getBoard(BOARD_ID);
    board.boards[0].items.forEach(async (item) => {
      const itemName = await monday.getItem(Number(item.id));
      // console.log(itemName.items[0].name);
      if (!tweetsCache[Number(itemName.items[0].name)]) {
        tweetsCache[Number(itemName.items[0].name)] = { fetched: true };
      }
    });
  };
  getBoardItems();

  twitter.on({ search: "@reshuffleHQ" }, async (event, app) => {
    for (const tweet of event.tweets) {
      if (!tweetsCache[tweet.id]) {
        tweetsCache[tweet.id] = {
          user: tweet.user.screen_name,
          date: tweet.created_at,
          tweet: tweet.text,
        };
        createItems(JSON.stringify(tweet.id));
      }
    }
    console.log(tweetsCache);
  });

  app.start(8000);
})().catch(console.error);
