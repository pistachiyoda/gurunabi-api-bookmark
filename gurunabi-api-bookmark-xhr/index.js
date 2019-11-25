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
button.addEventListener("click", () => {
  let searchWord = document.getElementById("searchWord").value;
  let gurunabiAPI = new GurunabiAPI();
  gurunabiAPI.search(searchWord, restaurants => {
    let render = new Renderer();
    render.clearHTML();
    render.renderToHtml(restaurants);
  });
});

// お気に入りを表示する
const favButton = document.getElementById("favlist");
favButton.addEventListener("click", () => {
  let gurunabiAPI = new GurunabiAPI();
  let favorite = new Favorite();
  let shopIdList = favorite.getAll();
  gurunabiAPI.getRestaurantsByIds(shopIdList, restaurants => {
    console.log("test");
    let render = new Renderer();
    render.clearHTML();
    render.renderToHtml(restaurants);
  });
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
  search(searchWord, callback) {
    //let searchWord = document.getElementById("search-id").Value;
    let url = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${API_KEY}&freeword=${searchWord}`;
    this.sendRequest(url, callback);
  }
  // リクエスト処理をするメソッド
  sendRequest(url, callback) {
    const request = new XMLHttpRequest();
    // 順番的にはopen->send->onload
    // onloadだとレスポンスに対しての処理をコールバック関数で渡さないといけない
    // onloadを先に書いておかないと、onloadが登録される前にsendに対するレスポンスが返ってきてしまいonloadが実行されないかのうせいがある
    request.onload = function() {
      let res = JSON.parse(request.responseText);
      let restaurants = [];
      for (let i = 0; i < res.rest.length; i++) {
        let restaurantName = res.rest[i].name;
        let restaurantImage = res.rest[i].image_url.shop_image1;
        let restaurantId = res.rest[i].id;
        let restaurant = new Restaurant(
          restaurantName,
          restaurantImage,
          restaurantId
        );
        restaurants.push(restaurant);
      }
      callback(restaurants);
    };
    request.open("GET", url, true);
    request.send();
  }
  // shopidからレストランを取得するメソッド
  getRestaurantsByIds(favoriteShopIdList, callback) {
    let strFavoriteShopIdList = favoriteShopIdList.join(",");
    let url = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=201d6d74395c32817d558de2e04183d2&id=${strFavoriteShopIdList}`;
    this.sendRequest(url, callback);
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
