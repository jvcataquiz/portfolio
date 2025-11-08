$('#myModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) 
  var recipient = button.data('whatever')
  var modal = $(this)

  const data = {
    "Cert1" :`<iframe "https://drive.google.com/file/d/1qvr266Pj_Gc5mtVME4Jk93b7-F3DZF2R/preview" width="100%" height="600vh" allow="autoplay"></iframe>`
  }

  var datavalue = data[recipient]
  // modal.find('.modal-title').text(recipient + ' Certificate' )
  modal.find('.modal-body').html(datavalue)

})
