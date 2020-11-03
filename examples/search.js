require("dotenv").config();
const { Reshuffle } = require("reshuffle");
const { TwitterConnector } = require("reshuffle-twitter-connector");

(async () => {
  const app = new Reshuffle();
  const twitter = new TwitterConnector(app, {
    customerKey: process.env.TWITTER_CUSTOMER_KEY,
    customerSecret: process.env.TWITTER_CUSTOMER_SECRET,
  });

  twitter.on({ search: "@reshuffleHQ" }, async (event, app) => {
    const tweetsCache = {};
    for (const tweet of event.tweets) {
      if (!tweetsCache[tweet.id]) {
        tweetsCache[tweet.id] = {
          user: tweet.user.screen_name,
          date: tweet.created_at,
          tweet: tweet.text,
        };
      }
    }
    console.log(tweetsCache);
  });

  app.start(8000);
})().catch(console.error);
