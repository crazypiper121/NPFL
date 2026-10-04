(function () {
  "use strict";

  var SAVE_KEY = "npflManager26.save";

  var listEl = document.getElementById("clubs");
  var cardEl = document.getElementById("card");
  var startBtn = document.getElementById("start");
  var statusEl = document.getElementById("status");
  var seasonEl = document.getElementById("season");

  var clubs = [];
  var selected = null;

  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeSave(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function addRow(dl, label, value, unit) {
    var dt = document.createElement("dt");
    dt.textContent = label;
    var dd = document.createElement("dd");
    if (value === null || value === undefined) {
      dd.textContent = "To be added";
      dd.className = "todo";
    } else {
      dd.textContent = unit ? value.toLocaleString() + " " + unit : value;
    }
    dl.appendChild(dt);
    dl.appendChild(dd);
  }

  function showCard(club) {
    cardEl.textContent = "";
    var h3 = document.createElement("h3");
    h3.textContent = club.name;
    var dl = document.createElement("dl");
    addRow(dl, "City", club.city);
    addRow(dl, "Stadium", club.stadium);
    addRow(dl, "Capacity", club.capacity, "seats");
    cardEl.appendChild(h3);
    cardEl.appendChild(dl);
  }

  function select(club, button) {
    selected = club;
    var buttons = listEl.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", "false");
    }
    button.setAttribute("aria-pressed", "true");
    showCard(club);
    startBtn.disabled = false;
    statusEl.textContent = "";
  }

  function renderList() {
    clubs.forEach(function (club) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = club.name;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () { select(club, btn); });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  startBtn.addEventListener("click", function () {
    if (!selected) return;
    var ok = writeSave({
      version: 1,
      clubId: selected.id,
      season: seasonEl.dataset.season,
      startedAt: new Date().toISOString()
    });
    statusEl.textContent = ok
      ? "Career saved: " + selected.name + ". The game itself comes in the next step."
      : "Could not save in this browser. Check that storage is allowed.";
  });

  fetch("clubs.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      clubs = data.clubs;
      seasonEl.dataset.season = data.season;
      seasonEl.textContent = data.league + " " + data.season;
      renderList();

      var save = loadSave();
      if (save) {
        var match = clubs.filter(function (c) { return c.id === save.clubId; })[0];
        if (match) statusEl.textContent = "Saved career: " + match.name;
      }
    })
    .catch(function () {
      listEl.textContent = "";
      var li = document.createElement("li");
      li.style.padding = "1rem";
      li.textContent = "Could not load clubs.json. Make sure it is uploaded next to index.html.";
      listEl.appendChild(li);
    });
})();
