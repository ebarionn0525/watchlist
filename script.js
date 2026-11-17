// Local Storageに保存するときの名前
const STORAGE_KEY = "my-watchlist";

const form = document.getElementById("add-form");
const titleInput = document.getElementById("title");
const workList = document.getElementById("work-list");
const count = document.getElementById("count");
const emptyMessage = document.getElementById("empty-message");
const message = document.getElementById("message");

// 保存済みの作品を読み込む。初回は空の配列にする。
let works = [];
try {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    if (!Array.isArray(parsedData)) throw new Error("Invalid data");
    works = parsedData;
  }
} catch (error) {
  message.textContent = "保存データを読み込めませんでした。ブラウザの設定を確認してください。";
}

// 作品の配列を文字列に変換して保存する。
function saveWorks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
    message.textContent = "";
  } catch (error) {
    message.textContent = "保存できませんでした。このページを閉じると変更が失われる可能性があります。";
  }
}

// 画面を作品の配列に合わせて作り直す。
function renderWorks() {
  workList.replaceChildren();
  emptyMessage.hidden = works.length > 0;
  const watchedCount = works.filter(function (work) {
    return work.watched;
  }).length;
  count.textContent = `全${works.length}件 / 視聴済み${watchedCount}件`;

  works.forEach(function (work, index) {
    const item = document.createElement("li");
    item.className = "work-item";
    if (work.watched) item.classList.add("watched");

    const label = document.createElement("label");
    label.className = "work-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = work.watched;
    const title = document.createElement("span");
    title.className = "work-title";
    title.textContent = work.title;
    label.append(checkbox, title);

    const status = document.createElement("span");
    status.className = "status";
    status.textContent = work.watched ? "視聴済み" : "見たい";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "削除";
    deleteButton.setAttribute("aria-label", `${work.title}を削除`);

    checkbox.addEventListener("change", function () {
      works[index].watched = checkbox.checked;
      saveWorks();
      renderWorks();
      // 描画し直した後もキーボード操作を続けられるようにする。
      workList.children[index].querySelector('input').focus();
    });
    deleteButton.addEventListener("click", function () {
      works.splice(index, 1);
      saveWorks();
      renderWorks();
      titleInput.focus();
    });
    item.append(label, status, deleteButton);
    workList.append(item);
  });
}

// フォームから作品を追加する。
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === "") {
    titleInput.value = "";
    titleInput.focus();
    return;
  }
  works.push({ title: title, watched: false });
  saveWorks();
  renderWorks();
  form.reset();
  titleInput.focus();
});

renderWorks();
