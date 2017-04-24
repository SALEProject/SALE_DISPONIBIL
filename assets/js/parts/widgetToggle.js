$(document).ready(function () {
  var width = Math.max( $(window).width(), window.innerWidth);

  if (width < 768) {
    $('.toggleable-widget').each(function () {
      var container = $('<div></div>');

      container.addClass('tile')
        .addClass('white')
        .addClass('m-b-10')
        .addClass('toggleable-widget');

      var div = $('<div></div>');
      div.html($(this).html())
        .attr('id', $(this).attr('id'));

      container.append(div);

      $('.secondary-widgets').append(container);
      $(this).remove();
    });

    $('.toggleable-widget').hide();
  }
});

$(document).on('touchstart click', '.toggle-widget', function (e) {
  e.preventDefault();

  $(this).parents('ul').find('a').removeClass('hover');
  $(this).addClass('hover');

  toggleWidget($(this).data('widget'));
});

function toggleWidget (widgetId) {
  var widget = $('#' + widgetId).parent();

  $('.toggleable-widget').slideUp('fast');

  widget.slideDown('fast');

  $('html, body').animate({
    scrollTop: widget.offset().top - 10
  }, 400);

  toggleMainMenu();
}
