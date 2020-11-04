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
      .sdk()
      .api(`query {boards (ids: ${BOARD_ID}) { columns { id title type } }}`)
      .then((res) => {
        // console.log(res.data.boards[0].columns);
        return res.data.boards[0].columns.map((col) => {
          return col.id;
        });
      })
      .then(async (col) => {
        // const newItems = await monday.sdk().api(
        //   `mutation {create_item (board_id: ${BOARD_ID}, item_name: \"${
        //     tweetInfo.id
        //   }\", column_values:
        //       \"{
        //         \\\"${col[1]}\\\":\\\"${tweetInfo.text.replace(/\n/g, "")}\\\",
        //         \\\"${col[2]}\\\":\\\"${tweetInfo.user.screen_name}\\\",
        //         \\\"${col[3]}\\\":\\\"{\\\"date\\\":\\\"2019 - 01 - 20\\\"}\\\"
        //       }\") {id}}`
        // );
        //   console.log(newItems);
        const body = {
          query: `
          mutation ($boardId: Int!,, $itemName: String!, $columnValues: JSON!) {
            create_item (
              board_id: $boardId,
              item_name: $itemName,
              column_values: $columnValues
            ) {
              id
            }
          }
          `,
          variables: {
            boardId: BOARD_ID,
            itemName: JSON.stringify(tweetInfo.id),
            columnValues: JSON.stringify({
              tweet17: tweetInfo.text,
              text: tweetInfo.user.screen_name,
              created_at: {
                date: new Date(Date.parse(tweetInfo.created_at))
                  .toISOString()
                  .split("T")[0],
              },
            }),
          },
        };
        axios
          .post(`https://api.monday.com/v2`, body, {
            headers: {
              Authorization: process.env.MONDAY_TOKEN,
            },
          })
          .catch((err) => {
            console.error("** error **", err.data);
          })
          .then((res) => {
            console.log("** success **", res.data);
          });
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
