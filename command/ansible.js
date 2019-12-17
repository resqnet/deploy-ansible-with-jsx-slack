const { jsxslack } = require("@speee-js/jsx-slack");
const fs = require('fs');
const ansible_info = JSON.parse(fs.readFileSync('./ansible.json', 'utf8'));

const options = (...props) => 
  Object.keys(ansible_info).map((key) => {
    return jsxslack.fragment`
      <Option value=${key}>${key}</Option>
    `;
  });

const modal = (props) => jsxslack`
  <Modal title="更新する環境を指定してください" close="キャンセル" callbackId="callback_ansible">
    <Select id="dev" name="dev" label="環境を選択">
      ${ options(props) }
    </Select>
    <Input id="branch" name="branch" label="ブランチ" title="ブランチを指定してください" required />
    <Input type="hidden" name="user_id" value={userId} />
    <Input type="submit" value="登録" />
  </Modal>
`;

module.exports = class ansible{
  constructor (app) {
    this.app = app;
  }
  
  init (){
    
    this.app.command('/ansible', async ({ack, payload, context }) => {
      ack();

      try {
        const result = this.app.client.views.open({
          token: context.botToken,
          trigger_id: payload.trigger_id,
          view: modal({keys: Object.keys(ansible_info)}),
        });
      }
      catch (error) {
        console.error(error);
      }
    });

    this.app.view('callback_ansible', async ({ ack, context,  view }) => {
      console.log('test');
      ack();

      const dev = view.state.values.dev.dev.selected_option.value;
      const branch = view.state.values.branch.branch.value;
      const msg = "dev+"を更新\nansible-playbook deploy.yml -i inventory-dev -l"+ansible_info[dev]+":localhost -e channel='ansible-dev'"

      try {
        this.app.client.chat.postMessage({
          token: context.botToken,
          channel: "bot_test",
          text: msg
        });
      }
      catch (error) {
        console.error(error);
      }
    });
  }
}
