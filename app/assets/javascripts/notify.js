function notifyUser(options) {
  $.notify({
    title: options.title,
    message: options.message
  },{
    type: 'pastel-' + options.type,
    z_index: 99999,
    delay: 5000,
    mouse_over: 'pause',
    animate: {
      enter: 'animated fadeInRight',
      exit: 'animated fadeOutRight'
    },
    template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      '<span data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '<a href="{3}" target="{4}" data-notify="url"></a>' +
      '</div>'
  });
}

