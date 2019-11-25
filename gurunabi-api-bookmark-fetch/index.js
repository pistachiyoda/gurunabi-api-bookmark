"use strict";
// モデルを考える
// モデルとは：そのアプリケーションのやりたいことを説明（＝ユーザーストーリー）するときに出てくる登場人物
// 食べログAPIで店を検索したい
// お気に入りに店を追加したい
// ↓ストーリーから仕様に落とし込む
// 詳細設計（クラス[なにが]とファンクション[何をする]を定義）
// サーチメソッドのあるぐるなびAPIクラスを作成する
// サーチメソッドは店クラスのインスタンスの配列を返す
// 店クラスの定義

const API_KEY = "ぐるなびAPI KEYを入力";

// キーワードでの検索結果を表示する
const button = document.getElementById("searchButton");
// asyncなメソッドでないとawaitできない
button.addEventListener("click", async () => {
  let searchWord = document.getElementById("searchWord").value;
  let gurunabiAPI = new GurunabiAPI();
  // ↓でrestransのPromiseを返す
  let restaurants = await gurunabiAPI.search(searchWord);
  let render = new Renderer();
  render.clearHTML();
  render.renderToHtml(restaurants);
});

// お気に入りを表示する
const favButton = document.getElementById("favlist");
favButton.addEventListener("click", async () => {
  let gurunabiAPI = new GurunabiAPI();
  let favorite = new Favorite();
  let shopIdList = favorite.getAll();
  let restaurants = await gurunabiAPI.getRestaurantsByIds(shopIdList);
  let render = new Renderer();
  render.clearHTML();
  render.renderToHtml(restaurants);
});

// 店クラス
class Restaurant {
  constructor(name, image, shopId) {
    this.name = name;
    this.image = image;
    this.shopId = shopId;
  }
}

// ぐるなびAPIクラス（サーチメソッド）
class GurunabiAPI {
  // 検索ワードを受け取ってサーバーにリクエストを送るメソッド
  async search(searchWord) {
    //let searchWord = document.getElementById("search-id").Value;
    let url = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${API_KEY}&freeword=${searchWord}`;
    return await this.sendRequest(url);
  }
  // リクエスト処理をするメソッド
  // 中で非同期（await）をしたらその関数もasync関数となる
  async sendRequest(url) {
    // fetchはレスポンスのpromiseを返す
    let response = await fetch(url);
    // json()はpromiseを返すjsonなのでawaitする
    let json = await response.json();
    let restaurants = [];
    for (let i = 0; i < json.rest.length; i++) {
      let restaurantName = json.rest[i].name;
      let restaurantImage = json.rest[i].image_url.shop_image1;
      let restaurantId = json.rest[i].id;
      let restaurant = new Restaurant(
        restaurantName,
        restaurantImage,
        restaurantId
      );
      restaurants.push(restaurant);
    }
    return restaurants;
  }
  // shopidからレストランを取得するメソッド
  async getRestaurantsByIds(favoriteShopIdList) {
    let strFavoriteShopIdList = favoriteShopIdList.join(",");
    let url = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=201d6d74395c32817d558de2e04183d2&id=${strFavoriteShopIdList}`;
    return await this.sendRequest(url);
  }
}

// レンダークラス（htmlにレンダリングする機能をもつクラス）
class Renderer {
  renderToHtml(restaurants) {
    let wrapper = document.getElementById("wrapper");
    let favorite = new Favorite();
    for (let i = 0; i < restaurants.length; i++) {
      let restaurant = restaurants[i];
      let div = document.createElement("div");
      div.innerHTML = restaurant.name;
      wrapper.appendChild(div);
      let iconWrapper = document.createElement("span");
      iconWrapper.addEventListener("click", () => {
        if (favorite.getAll().includes(restaurant.shopId)) {
          favorite.remove(restaurant.shopId);
        } else {
          favorite.add(restaurant.shopId);
        }
        this.clearHTML();
        this.renderToHtml(restaurants);
      });
      let icon = document.createElement("i");
      let favoriteShopIds = favorite.getAll();
      let status = favoriteShopIds.includes(restaurant.shopId) ? "fas" : "far";
      icon.classList.add(status);
      icon.classList.add("fa-heart");
      iconWrapper.appendChild(icon);
      div.append(iconWrapper);
      let img_node = document.createElement("img");
      img_node.src = restaurant.image;
      div.append(img_node);
    }
  }
  clearHTML() {
    let wrapper = document.getElementById("wrapper");
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
  }
}

// お気に入りクラス
class Favorite {
  add(shopId) {
    let favoriteShopIdList = this.getAll();
    favoriteShopIdList.push(shopId);
    localStorage.setItem(
      "favoriteShopIdList",
      JSON.stringify(favoriteShopIdList)
    );
  }
  remove(shopId) {
    let favoriteShopIdList = this.getAll();
    let newFaoriteShopIdList = favoriteShopIdList.filter(
      shop => shop !== shopId
    );
    localStorage.setItem(
      "favoriteShopIdList",
      JSON.stringify(newFaoriteShopIdList)
    );
  }
  getAll() {
    let favoriteShopIdList = localStorage.getItem("favoriteShopIdList")
      ? JSON.parse(localStorage.getItem("favoriteShopIdList"))
      : [];
    return favoriteShopIdList;
  }
}
