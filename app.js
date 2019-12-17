const { App, LogLevel } = require("@slack/bolt");
const { jsxslack } = require("@speee-js/jsx-slack");
const path = require('path');
const dirPath = path.resolve(__dirname, 'command');
const fs = require('fs');
const paths = fs.readdirSync(dirPath);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: {
    events: '/slack/events',
    commands: '/slack/commands'
  }
});

paths.forEach(file => {
    const path = `${dirPath}/${file}`;
    const module = require(path);
    let command = new module(app);
    command.init();
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 4000);

  console.log('⚡️ Bolt app is running!');
})();
