var LitElement = LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
var html = LitElement.prototype.html;
var css = LitElement.prototype.css;

class FingerprintReader extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
      inputValue: { type: Number },
      inputName: { type: String },
      _show_main: {},
      _show_options: {},
      _show_automations: {},
    };
  }

  constructor() {
    super();
    this.inputValue = 1;
    this._show_options = false;
    this._show_automations = false;
    this._show_main = true;
  }

  render() {
    const saver = this.hass.states[this.config.saver].attributes.variables;
    const state = this.hass.states[this.config.state_fingerprint].state;
    const name = this.config.name ? this.config.name: "Lettore Impronte"
    const show_title = this.config.show_title ? this.config.show_title : "true";
    const name_align = this.config.name_align ? this.config.name_align : "left";
    let backgroundcolor = "";
    let color = "";
    let icon = "mdi:fingerprint";

    if (state === "Impronta non autorizzata") {
      backgroundcolor = "red";
      color = "white;";
      icon = "mdi:shield-alert-outline";
    } else if (state === "Impronta autorizzata") {
      backgroundcolor = "green";
      color = "white;";
      icon = "mdi:lock-open-variant-outline";
    }

    return html`
    <div class="card">
      <h2 style="text-align: ${name_align}; ${show_title == "true" ? ' ' : 'display:none;'}" >${this.config.name ? html`${this.config.name}` : name }</h2>

      ${this._show_main ? html`
      <div style="display: flex;">
        <div class="last_user">Ultimo accesso:&nbsp;<span style="font-size: 16px;">${saver[this.hass.states[this.config.last_id].state]}</span></div>
        ${this.config.automation_list ? html`
          ${this.config.automation_list.length === 1 ? html`
            <div class="${this.hass.states[this.config.automation].state === 'on' ? 'automation_active' : 'option_div'}"
                 style="margin-right: 15px;" 
                 @click="${() => this.toggleDoor()}">
              <ha-icon class="option"  icon="mdi:refresh-auto"></ha-icon>
            </div>
          ` : html`
            <div class="option_div" 
                 style="margin-right: 15px; 
                        background-color: ${this._isAutomationOn() ? 'var(--switch-checked-button-color)' : 'var(--primary-background-color)'}; 
                        color: ${this._isAutomationOn() ? 'white' : ''};"  
                 @click="${() => { this._show_automations = !this._show_automations; this._show_main = !this._show_main; }}">
              <ha-icon class="option"  icon="mdi:refresh-auto"></ha-icon>
            </div>
          `}
        ` : html``}
        <div class="option_div" 
             @click="${() => { this._show_options = true; this._show_main = false; }}">
          <ha-icon class="option"  icon="mdi:cog-outline"></ha-icon>
        </div>
      </div>
      <div class="display" 
           style="background-color: ${backgroundcolor}; color: ${color};">
        <ha-icon icon="${icon}"></ha-icon>
        <h2 class="text_display">${this.hass.states[this.config.state_fingerprint].state}</h2>
      </div>
    ` : html``}
    
    

    ${this._show_options ? html`
    <div style="display: flex;">
      <div class="number-input">
        <button @click="${() => this.decrement()}"></button>
        <div class="id_number">id: ${this.inputValue}</div>
        <input class="input_text" type="text" id="inputName" value="${saver[this.inputValue] != null ? saver[this.inputValue] : 'inserisci nome'}" @input="${(e) => this.updateName(e)}">
        <input class="quantity" min="0" name="quantity" type="number" value="${this.inputValue}" @input="${(e) => this.updateValue(e)}">
        <button @click="${() => this.increment()}" class="plus"></button>
      </div>
      <div class="option_div">
        <ha-icon class="option" icon="mdi:undo-variant" @click="${() => { this._show_options = false; this._show_main = true; }}"></ha-icon>
      </div>
    </div>
    <div class="menage_button" style="display: flex;">
      <button @click="${() => this.callService()}"><ha-icon class="option" icon="mdi:fingerprint"></ha-icon> Rec</button>
      <button @click="${() => this.cancelService()}"><ha-icon class="option" icon="mdi:fingerprint-off"></ha-icon> Canc</button>
      <button @click="${() => this.renameService()}"><ha-icon class="option" icon="mdi:form-textbox"></ha-icon> Rename</button>
    </div>
  ` : html``}


      
      ${this._show_automations ? html`
      <div class="auto_back">
      <div class="last_user">Numero di automazioni: ${this.config.automation_list.length}</div>

      <div class="option_div">
          <ha-icon class="option"  icon="mdi:undo-variant" @click=${() => { this._show_automations = !this._show_automations; this._show_main = !this._show_main; }}></ha-icon>
        </div>
      </div>
      <div class="automations_buttons">
        ${this.config.automation_list.map(ent => {
      const stateObj = this.hass.states[ent.automation];
      return stateObj ? html`

            <div class="buttons_automations_container">
              <ha-icon class="${stateObj.state == "on" ? 'button_on_ha-icon option' : 'button_off_ha-icon option'}" icon="${ent.icon || 'mdi:refresh-auto'}" @click="${() => this._toggleAutomation(ent.automation)}"/></ha-icon>
              <div class="left_row text ">${ent.name || stateObj.attributes.friendly_name} ${stateObj.state} </div>   
              <div class="left_row label">${ent.label || ' '}</div>
            </div>
          ` : html``;
    })}
      </div>
      ` : html` `}
    </div>

      `;
  }


  _isAutomationOn() {
    return this.config.automation_list.some(ent => {
      const stateObj = this.hass.states[ent.automation];
      return stateObj && stateObj.state === 'on';
    });
  }

  _toggleAutomation(automation) {
    this.hass.callService("automation", "toggle", {
      entity_id: automation
    });
  }

  updateValue(e) {
    this.inputValue = e.target.value;
    this.shadowRoot.getElementById("inputName").value = this.hass.states[this.config.saver].attributes.variables[this.inputValue] != null ? this.hass.states[this.config.saver].attributes.variables[this.inputValue] : 'inserisci nome';
  }
  updateName(e) {
    this.inputName = e.target.value;
  }

  increment() {
    this.inputValue++;
    this.updateValue({ target: { value: this.inputValue } });
  }

  decrement() {
    this.inputValue--;
    this.updateValue({ target: { value: this.inputValue } });
  }

  callService() {
    let esp_name = this.hass.config.esp_name || "fingerprint_reader";
    this.hass.callService("esphome", `${esp_name}_enroll`, {
      finger_id: this.inputValue,
      num_scans: 2
    });
    this.hass.callService("saver", "set_variable", {
      name: this.inputValue,
      value: this.inputName,
    });
    this.shadowRoot.getElementById("inputName").value = "appoggia il dito";

    setTimeout(() => {
      this.updateValue({ target: { value: this.inputValue } });
    }, 8000);
    ;

  }
  cancelService() {
    let esp_name = this.hass.config.esp_name || "fingerprint_reader";
    this.hass.callService("esphome", `${esp_name}_delete`, {
      finger_id: this.inputValue,
    });
    this.hass.callService("saver", "delete_variable", {
      name: this.inputValue,
    });
    this.shadowRoot.getElementById("inputName").value = "impronta cancellata";
    setTimeout(() => {
      this.updateValue({ target: { value: this.inputValue } });
    }, 2000);
  }

  renameService() {
    this.hass.callService("saver", "set_variable", {
      name: this.inputValue,
      value: this.inputName,
    });

  }

  toggleDoor() {
    this.hass.callService("automation", "toggle", {
      entity_id: this.config.automation
    });
  }

  setConfig(config) {
    if (!config.saver) {
      throw new Error("You need to define saver component");
    }
    if (!config.state_fingerprint) {
      throw new Error("You need to define state_fingerprint sensor");
    }

    if (!config.sensor_record) {
      throw new Error("You need to define sensor_record sensor");
    }
    if (!config.last_id) {
      throw new Error("You need to define last_id sensor");
    }

    this.config = config;
  }

  getCardSize() {
    return this.config.entities.length + 1;
  }

  static get styles() {
    return css`
    :host {
      background: var(--ha-card-background, var(--card-background-color, white) );
      border-radius: var(--ha-card-border-radius, 4px);
      box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
      color: var(--primary-text-color);
      display: block;
      transition: all .3s ease-out 0s;
      position: relative
  }
  
  ha-icon {
      display: inline-block;
      --mdc-icon-size: 50px;
      --iron-icon-width: 50px;
      --iron-icon-height: 50px;
      text-align: center
  }
  
  .automation_active,.option_div {
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--ha-card-border-radius, 12px);
      width: 40px;
      height: 40px;
      cursor: pointer
  }
  
  .option_div {
      border-width: var(--ha-card-border-width, 1px);
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0) );
      border-style: solid
  }
  
  .automation_active {
      border: 0;
      color: #fff;
      background-color: var(--switch-checked-button-color)
  }
  
  .option {
      --mdc-icon-size: 24px;
      --iron-icon-width: 24px;
      --iron-icon-height: 24px
  }
  
  .auto_back {
      display: flex;
      justify-content: flex-end
  }
  
  .card {
      display: flex;
      flex-direction: column;
      padding: 16px
  }
  
  .display,.id_name,.last_user {
      display: flex;
      align-items: center
  }
  
  .last_user {
      height: 40px;
      margin-right: 15px;
      border-radius: var(--ha-card-border-radius, 12px);
      border-width: var(--ha-card-border-width, 1px);
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0) );
      border-style: solid;
      margin-bottom: 15px;
      padding-left: 15px;
      flex-grow: 4;
      font-size: 12px
  }
  
  .display,.id_name {
      justify-content: center
  }
  
  .display {
      height: 82px;
      background-color: var(--secondary-background-color);
      border-radius: 15px
  }
  
  .id_name {
      flex-grow: 4;
      font-size: 16px
  }
  
  .input_text,.text_display {
      width: 75%;
      text-align: center
  }
  
  .input_text {
      border: 0;
      font-size: 16px;
      flex-grow: 5;
      width: 110px
  }
  
  .id_number,.number-input button {
      align-items: center;
      justify-content: center
  }
  
  .id_number {
      display: flex;
      font-size: 16px;
      width: 40px
  }
  
  .number-input {
      border-radius: var(--ha-card-border-radius, 12px);
      border-width: var(--ha-card-border-width, 1px);
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0) );
      border-style: solid;
      display: flex;
      flex-grow: 4;
      margin-right: 15px
  }
  
  .number-input button {
      outline: 0;
      -webkit-appearance: none;
      background-color: transparent;
      border: 0;
      width: 3rem;
      height: 3rem;
      cursor: pointer;
      margin: 0;
      position: relative
  }
  
  .number-input button:after,.number-input button:before {
      display: inline-block;
      position: absolute;
      content: "";
      width: 1rem;
      height: 2px;
      background-color: #212121;
      transform: translate(-50%,-50%)
  }
  
  .number-input button.plus:after {
      transform: translate(-50%,-50%) rotate(90deg)
  }
  
  .number-input input[type=number] {
      font-family: Raleway;
      max-width: 5rem;
      padding: .5rem;
      font-size: 2rem;
      height: 3rem;
      font-weight: 700;
      text-align: center;
      display: none
  }
  
  .menage_button {
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
      height: 70px
  }
  
  .menage_button button {
      background-color: var(--secondary-background-color);
      border: 0;
      height: 50px;
      width: 30%;
      border-radius: 15px;
      cursor: pointer
  }
  
  .buttons_automations_container {
      display: grid;
      grid-template-columns: 38px auto;
      grid-template-rows: 19px 19px;
      grid-template-areas: "menu main""menu footer";
      background-color: transparent;
      margin-bottom: 10px;
      width: 50%
  }
  
  .buttons_automations_container>div {
      text-align: left;
      font-size: 14px
  }
  
  .left_row {
      margin-left: 15px
  }
  
  .label,.text {
      color: var(--primary-text-color);
      font-size: 12px
  }
  
  .text {
      grid-area: main;
      display: block;
      font-weight: 700;
      letter-spacing: "-0.01em"
  }
  
  .label {
      grid-area: footer;
      //display: block
  }
  
  .button_off_ha-icon,.button_on_ha-icon {
      cursor: pointer;
      border-radius: var(--ha-card-border-radius, 12px);
      grid-area: menu/menu/menu/menu;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center
  }
  
  .button_off_ha-icon {
      border-width: var(--ha-card-border-width, 1px);
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0) );
      border-style: solid;
      color: var(--state-icon-secondary-color)
  }
  
  .button_on_ha-icon {
      background-color: var(--switch-checked-button-color);
      color: #ffff
  }
  
  .automations_buttons {
      display: flex;
      flex-wrap: wrap;
      height: 88px;
      -ms-overflow-style: none;
      scrollbar-width: none;
      overflow-y: scroll;
      margin-top: -6px;
  }
  
  .automations_buttons::-webkit-scrollbar {
      display: none
  }


      `;
  }

}

customElements.define('fingerprint-reader', FingerprintReader);
