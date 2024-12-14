const storage = (typeof browser !== "undefined" ? browser : chrome).storage;

var settings = {
  _blackoutDelay: 10,
  _chatFlipDelay: 10,
  _hideHighlight: 10,
  get blackoutDelay() {
    return this._blackoutDelay;
  },
  set blackoutDelay(val) {
    this._blackoutDelay = val;
    storage.sync.set({ blackoutDelay: val });
  },
  get chatFlipDelay() {
    return this._chatFlipDelay;
  },
  set chatFlipDelay(val) {
    this._chatFlipDelay = val;
    storage.sync.set({ chatFlipDelay: val });
  },
  get hideHighlight() {
    return this._hideHighlight || false;
  },
  set hideHighlight(val) {
    this._hideHighlight = val;
    storage.sync.set({ hideHighlight: val });
  },
};
var blackoutDelayInput;
var chatFlipDelayInput;
var hideHighlightInput;
const MIN_DELAY = 1;
const MIN_FLIP_DELAY = 0;

function initUI() {
  blackoutDelayInput = document.getElementById("blackoutDelay");
  blackoutDelayInput.onchange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value <= MIN_DELAY) {
      settings.blackoutDelay = MIN_DELAY;
      blackoutDelayInput.value = MIN_DELAY;
    } else {
      settings.blackoutDelay = value;
    }
  };
  chatFlipDelayInput = document.getElementById("chatFlipDelay");
  chatFlipDelayInput.onchange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < MIN_FLIP_DELAY) {
      settings.chatFlipDelay = MIN_FLIP_DELAY;
      chatFlipDelayInput.value = MIN_FLIP_DELAY;
    } else {
      settings.chatFlipDelay = value;
    }
  };
  hideHighlightInput = document.getElementById("hideHighlight");
  hideHighlightInput.onchange = (e) => {
    settings.hideHighlight = e.target.checked
  };
}

function initStorage() {
  storage.sync.get(["blackoutDelay", "chatFlipDelay", "hideHighlight"], function (res) {
    settings.blackoutDelay = res["blackoutDelay"] ?? 10;
    blackoutDelayInput.value = settings.blackoutDelay;
    settings.chatFlipDelay = res["chatFlipDelay"] ?? 10;
    chatFlipDelayInput.value = settings.chatFlipDelay;
    settings.hideHighlight = res["hideHighlight"] ?? false;
    hideHighlightInput.checked = settings.hideHighlight;
  });
}

initUI();
initStorage();
