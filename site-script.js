$(function () {
  var url = "http://pipes.yahoo.com/pipes/pipe.run?_callback=?";

  $.getJSON(url, {
    _id:       '9471f9d1faa1018490a267ad445c7bad',
    _render:   'json',
    user_id:   'hail2u'
  }, function (data) {
    var activities = $("#activities").empty();
    $.each(data.value.items, function (i, item) {
      if (i > 50) {
        return false;
      }

      var activity = $("<div/>").addClass("activity").append($("<h3/>").append($("<a/>").attr({
        href: item.link
      }).append(item.title))).append($("<p/>").addClass("timestamp").append(item.pubDate)).append(item.description);
      (i % 2 === 0) ? activity.addClass("even") : activity.addClass("odd");
      activity.appendTo(activities);
    });
  });
});
