## Getting Started

This example will be using 2 [Reshuffle](https://dev.reshuffle.com) connectors to integrate Twitter and Monday services.

For full documentation on connectors:

[Twitter Connector](https://github.com/reshufflehq/reshuffle-twitter-connector)
    
[Monday Connector](https://github.com/reshufflehq/reshuffle-monday-connector)

## Instructions

Run the following in your shell of choice:

    git clone https://github.com/alanblee/reshuffle-twitter-mentions.git
    cd reshuffle-twitter-mentions
    npm i

Create a .env file for your Twitter and Monday credentials

Create a new board from your Monday dashboard and get the `BOARD_ID` from the url (eg. new-board-name.monday.com/board/2193445)

Create columns to match:

| Column        | Type         |
| ------------- | ------------ |
| tweet         | Long-text    |
| user          | Text         |
| created-at    | Date         |

Should look something like this:

![Monday Board](https://i.imgur.com/yp1Rw4s.jpg)

Update the search string to anything you want to track

With that all set up run the follow in your shell:
    
    node examples/search.js


    
    
