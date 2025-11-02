$('#myModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) 
  var recipient = button.data('whatever')
  var modal = $(this)

  const data = {
    "Cert1" :`<iframe src="https://drive.google.com/file/d/1pNMKp4wwftYGbcrQq5aNxQYPk0b6u5bj/preview" width="100%" height="600vh" allow="autoplay"></iframe>`
  }

  var datavalue = data[recipient]
  // modal.find('.modal-title').text(recipient + ' Certificate' )
  modal.find('.modal-body').html(datavalue)

})