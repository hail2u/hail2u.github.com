var TRACKING_ID = "hail2unet-22";
var PRODUCT_GROUP_JA = {
  "Apparel":           "アパレル&ファッション雑貨",
  "Baby Product":      "ベビー&マタニティ",
  "Book":              "本・漫画・雑誌",
  "CE":                "家電&カメラ",
  "DVD":               "DVD",
  "Grocery":           "食品&飲料",
  "Health and Beauty": "ヘルス&ビューティー",
  "Kitchen":           "ホーム&キッチン",
  "Music":             "ミュージック",
  "Office Product":    "文房具・オフィス用品",
  "Shoes":             "シューズ",
  "Software":          "PCソフト",
  "Sports":            "スポーツ&アウトドア",
  "Toy":               "おもちゃ",
  "VHS":               "ビデオ",
  "Video Games":       "TVゲーム",
  "Watch":             "時計"
};

function doSearch (q, p) {
  var result = $("#result").empty();

  showMessage("検索中……");

  var url = "http://aap.hail2u.net/?" + $.param({
    Service:        "AWSECommerceService",
    Operation:      "ItemSearch",
    SearchIndex:    "All",
    ResponseGroup:  "Small,Images,OfferSummary",
    Version:        "2009-07-01",
    AWSAccessKeyId: "08PWFCAAQ5TZJT30SKG2",
    AssociateTag:   TRACKING_ID,
    Keywords:       q,
    ItemPage:       p
  });
  $.queryYQL("select * from xml where url='" + url + "'", function (data) {
    var res = data.query.results.ItemSearchResponse;

    if (res.Items.Request.Errors) {
      showMessage([
        res.Items.Request.Errors.Error.Code,
        res.Items.Request.Errors.Error.Message
      ].join(": "));
    } else {
      var page = res.Items.Request.ItemSearchRequest.ItemPage;
      var items = $.makeArray(res.Items.Item); // 検索結果が1件の時も配列にしておく

      // 概要
      var from = ((page - 1) * 10 + 1);
      showMessage([
        "<a href=\"http://www.amazon.co.jp/\">Amazon.co.jp</a> から <em>",
        q,
        "</em> を検索した結果 約 <em>",
        res.Items.TotalResults,
        "</em> 件中 <em>",
        from,
        "-",
        (from + items.length - 1),
        "</em> 件を表示しています"
      ].join(""));

      // 検索結果のリスト
      $.each(items, function () {
        var item = $("<div/>").addClass("item");

        // 画像
        var image = $("<img/>").attr({
          alt: this.ItemAttributes.Title
        });

        if (this.MediumImage) {
          image.attr({
            src: this.MediumImage.URL,
            width: this.MediumImage.Width.content,
            height: this.MediumImage.Height.content
          });
        } else {
          image.attr({
            src: "http://g-ecx.images-amazon.com/images/G/09/x-site/icons/no-img-sm.gif",
            width: 60,
            height: 40
          });
        }

        $("<p/>").addClass("image").append($("<a/>").attr({
           href: this.DetailPageURL
        }).append(image)).appendTo(item);

        // タイトル
        var title = $("<h2/>").addClass("title").append($("<a/>").attr({
           href: this.DetailPageURL
        }).append(this.ItemAttributes.Title)).appendTo(item);

        // その他情報
        var detail = $("<ul/>").addClass("detail");

        if (this.ItemAttributes.Actor) {
          $("<li/>").append(this.ItemAttributes.Actor.toString()).appendTo(detail);
        }

        if (this.ItemAttributes.Artist) {
          $("<li/>").append(this.ItemAttributes.Artist.toString()).appendTo(detail);
        }

        if (this.ItemAttributes.Author) {
          $("<li/>").append(this.ItemAttributes.Author.toString()).appendTo(detail);
        }

        if (this.ItemAttributes.Manufacturer) {
          $("<li/>").append(this.ItemAttributes.Manufacturer.toString()).appendTo(detail);
        }

        $("<li/>").append(PRODUCT_GROUP_JA[this.ItemAttributes.ProductGroup.toString()]).appendTo(detail);
        $("<li/>").append(this.ASIN.toString()).appendTo(detail);
        detail.appendTo(item);

        // 価格
        var price = $("<p/>").addClass("price");

        if (this.OfferSummary.TotalNew > 0 && this.OfferSummary.LowestNewPrice) {
          price.append(this.OfferSummary.LowestNewPrice.FormattedPrice + " ～");
        } else {
          price.append("新品の価格情報がありません");
        }

        price.appendTo(item);

        // 区切り
        $("<hr/>").appendTo(item);

        item.appendTo(result);
      });

      // ページング
      var paging = $("<div/>").addClass("paging");
      var prev = $("<p/>").addClass("prev");
      var next = $("<p/>").addClass("next");

      if (page > 1) {
        var pagePrev = page / 1 - 1;
        var urlPrev = (pagePrev === 1) ? "#" + encodeURIComponent(q) : "#" + encodeURIComponent(q) + ":" + pagePrev;
        prev.append($("<a/>").attr({
          href: urlPrev
        }).click(function () {
          doSearch(q, pagePrev);
        }).append("戻る"));
      } else {
        prev.append("戻る");
      }

      if (page > 4 || page >= res.Items.TotalPages) {
        next.append("次へ");
      } else {
        var pageNext = page / 1 + 1;
        var urlNext = "#" + encodeURIComponent(q) + ":" + pageNext;
        next.append($("<a/>").attr({
          href: urlNext
        }).click(function () {
          doSearch(q, pageNext);
        }).append("次へ"));
      }

      paging.append(prev).append(next).appendTo(result);
    }
  });
}

function showMessage (s) {
  $("#message").empty().append($("<p/>").append(s));
}

$(function () {
  $("#searchForm").submit(function () {
    q = $("#q").val();
    location.hash = "#" + encodeURIComponent(q);
    doSearch(q, 1);
    return false;
  });

  showMessage("初期化完了");

  if (location.hash) {
    var p = 1;
    var q = decodeURIComponent(location.hash.replace(/^#/, ""));

    if (q.match(/^(.+):(\d+)$/)) {
      q = RegExp.$1;
      p = RegExp.$2;
    }

    $("#q").val(q);
    doSearch(q, p);
  }
});
