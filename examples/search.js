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
  const BOARD_ID = Number(process.env.MONDAY_BOARD_ID);

  const tweetsCache = {};

  const createItems = async (tweetInfo) => {
    monday
      .getColumn(BOARD_ID)
      .then((res) => {
        return res.boards[0].columns.map(({ title }) => title);
      })
      .then(async (title) => {
        const testObj = {
          [title[1]]: () => tweetInfo.text,
          [title[2]]: () => tweetInfo.user.screen_name,
          [title[3]]: () =>
            new Date(Date.parse(tweetInfo.created_at))
              .toISOString()
              .split("T")[0],
        };

        const testQuery = await monday.createItem(
          BOARD_ID,
          JSON.stringify(tweetInfo.id),
          testVars
        );
        console.log(testQuery);
      });
  };

  // Checks to see if any tweets are on the board to prevent duplicates to be added
  (async () => {
    const boardItems = await monday.getBoardItems(BOARD_ID);

    for (let id in boardItems.items) {
      if (!tweetsCache[boardItems.items[id].name]) {
        tweetsCache[boardItems.items[id].name] = { fetched: true };
      }
    }
  })().catch(console.error);

  twitter.on({ search: "biden" }, async (event, app) => {
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
