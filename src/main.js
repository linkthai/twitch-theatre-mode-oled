var htmlBody = document.body;
var theatre, chat;
var timeout;
var column;
var header;
var border;
var leaderboard;
var content;
var scrollbar;
var chatinput;
var highlight;
var collapseBtn;
var hasInitOnce = false;
var isHiding = false;
var hasEvent = false;
var flip = false;
var hasInteractedRecently = false;

const storage = (typeof browser !== "undefined" ? browser : chrome).storage;

var blackoutDelay;
var chatFlipDelay;
var hideHighlight;

var flipTimeout;
var initFlipTimeout = () => {
  clearTimeout(flipTimeout);
  if (chatFlipDelay > 0) {
    flipTimeout = setTimeout(() => {
      flip = !flip;
      if (theatre && column) {
        if (flip) {
          theatre.classList.add("flipped-right");
          column.classList.add("flipped-left");
        } else {
          theatre.classList.remove("flipped-right");
          column.classList.remove("flipped-left");
        }
      }
      initFlipTimeout();
    }, chatFlipDelay * 60 * 1000);
  } else {
    flip = false;
    theatre.classList.remove("flipped-right");
    column.classList.remove("flipped-left");
  }
};

const init = () => {
  storage.sync.get(["blackoutDelay", "chatFlipDelay", "hideHighlight"], function (res) {
    blackoutDelay = res["blackoutDelay"] || 10;
    waitingForTheatre();
    chatFlipDelay = res["chatFlipDelay"] || 10;
    initFlipTimeout();
    hideHighlight = res["hideHighlight"] || false;
  });
  function storageChanged(changes) {
    if (changes["blackoutDelay"] && changes["blackoutDelay"]["newValue"]) {
      blackoutDelay = changes["blackoutDelay"]["newValue"];
    }
    if (changes["chatFlipDelay"] && changes["chatFlipDelay"]["newValue"]) {
      chatFlipDelay = changes["chatFlipDelay"]["newValue"];
      initFlipTimeout();
    }
    if (changes["hideHighlight"] && changes["hideHighlight"]["newValue"]) {
      hideHighlight = changes["hideHighlight"]["newValue"];
    }
  }
  storage.onChanged.addListener(storageChanged);
};
init();

const style = document.createElement("style");
style.textContent = `.flipped-left { 
  left: 0px !important;
 } 
.flipped-right { 
  right: 0px !important;
  left: auto !important; 
}`;
document.head.appendChild(style);

const show = () => {
  if (header) header.style.visibility = "visible";
  if (leaderboard) leaderboard.style.display = "block";
  if (chatinput) chatinput.style.visibility = "visible";
  if (highlight) highlight.style.visibility = "visible";
  if (collapseBtn) collapseBtn.style.visibility = 'visible';
  if (scrollbar) scrollbar.style.opacity = '1';
  isHiding = false;
};
const hide = () => {
  if (header) header.style.visibility = "hidden";
  if (leaderboard) leaderboard.style.display = "none";
  if (chatinput) chatinput.style.visibility = "hidden";
  if (highlight) highlight.style.visibility = "hidden";
  if (collapseBtn) collapseBtn.style.visibility = 'hidden';
  if (scrollbar) scrollbar.style.opacity = '0';
  isHiding = true;
};

var waitingForTheatre = () => {
  if (!theatre && hasInitOnce) {
    show();
    uninit();
  }
  timeout = setTimeout(() => {
    theatre = document.querySelector(".persistent-player--theatre");
    if (theatre) initTheatre();
    waitingForTheatre();
  }, blackoutDelay * 1000);
};

const uninit = () => {
  if (column) {
    column.removeChild(border);
  }
  if (chat) {
    chat.style.background = "initial";
  }
  if (content) {
    content.style.background = "initial";
  }
  chat = null;
  header = null;
  content = null;
  scrollbar = null;
  column = null;
  border = null;
  leaderboard = null;
  chatinput = null;
  highlight = null;
  collapseBtn = null;
  if (hasEvent) {
    document.removeEventListener("mousemove", interactEvent);
    document.removeEventListener("keydown", interactEvent);
    hasEvent = false;
    if (hideAgainTimeout) clearTimeout(hideAgainTimeout);
  }
};

const initTheatre = () => {
  if (!chat) {
    chat = document.querySelector(".stream-chat");
    if (chat) {
      chat.style.background = "black";
    }
  }
  header = document.querySelector(".stream-chat-header");
  scrollbar = document.querySelector(".chat-list--default .scrollbar-thumb") || document.querySelector(".chat-list--default .simplebar-track.vertical")
  if (!content) {
    content = document.querySelector(".chat-room__content");
    if (content) {
      content.style.background = "black";
    }
  }
  if (!column) {
    column = document.querySelector(".right-column--theatre");
    if (column) {
      border = document.createElement("div");
      border.style.position = "absolute";
      border.style.left = 0;
      border.style.top = 0;
      border.style.width = "1px";
      border.style.height = "100vh";
      border.style.background = "black";
      border.style.zIndex = "100";
      column.appendChild(border);
    }
  }
  if (!leaderboard) {
    const wrapperDiv = document.querySelector('.chat-room__content');
    const nestedDiv = wrapperDiv?.querySelector('.bits-leaderboard-expanded-top-three-entry__container') || 
    wrapperDiv?.querySelector('.channel-leaderboard-header-rotating__users');

    if (wrapperDiv && nestedDiv) {
      let currentDiv = nestedDiv;

      while (currentDiv && currentDiv !== wrapperDiv) {
        if (currentDiv.parentElement === wrapperDiv) {
          leaderboard = currentDiv; 
          break;
        }
        currentDiv = currentDiv.parentElement;
      }
    }
  }

  chatinput = document.querySelector(".chat-input");
  if (hideHighlight) {
    if (!highlight) {
      const wrapperDiv = document.querySelector('.chat-room__content');
      const nestedDiv = wrapperDiv?.querySelector('.community-highlight');

      if (wrapperDiv && nestedDiv) {
        let currentDiv = nestedDiv;

        while (currentDiv && currentDiv !== wrapperDiv) {
          if (currentDiv.parentElement === wrapperDiv) {
            highlight = currentDiv; 
            break;
          }
          currentDiv = currentDiv.parentElement;
        }
      }
    }
  } else {
    highlight = null;
  }
  if (!collapseBtn) collapseBtn = document.querySelector('[data-a-target="right-column__toggle-collapse-btn"]');
  if (!hasEvent) {
    document.addEventListener("mousemove", interactEvent);
    document.addEventListener("keydown", interactEvent);
    hasEvent = true;
  }
  if (!hasInitOnce) {
    hasInitOnce = true;
  }
  if (!hasInteractedRecently) {
    hide();
  }
};

var hideAgainTimeout;
var interactEvent = (event) => {
  show();
  hasInteractedRecently = true;
  if (hideAgainTimeout) clearTimeout(hideAgainTimeout);
  hideAgainTimeout = setTimeout(() => {
    hide();
    hasInteractedRecently = false;
  }, blackoutDelay * 1000);
};
