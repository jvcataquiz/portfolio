$('#myModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) 
  var recipient = button.data('whatever')
  var modal = $(this)

  const data = {
    "Cert1" :`<iframe src="https://drive.google.com/file/d/1QKsFraKQjFUxB1kzl_xMSInov-pUP_Q8/preview" width="100%" height="600vh" allow="autoplay"></iframe>`,
    "N5" :`<iframe src="https://drive.google.com/file/d/1FEOwNh9wj4LgpOZ5Ub_iw8kT3ZLVBNOg/preview" width="100%" height="600vh" allow="autoplay"></iframe>`,
    "S6" :`<iframe src="https://drive.google.com/file/d/1mZCRFkZqYoDTRQno2u9aCnZxyG7Kcnrd/preview" width="100%" height="600vh" allow="autoplay"></iframe>`,
    "J01" :`<iframe src="https://drive.google.com/file/d/1COTTK6OMBZ1FF9TQWOjL4S38QCssCDaP/preview" width="100%" height="600vh" allow="autoplay"></iframe>`,
    "WEB101" :`<iframe src="https://drive.google.com/file/d/1ZryL3likwCCFelvajcy6uqN0-KR5F3Gl/preview" width="100%" height="600vh" allow="autoplay"></iframe>`
  }

  
  var datavalue = data[recipient]
  // modal.find('.modal-title').text(recipient + ' Certificate' )
  modal.find('.modal-body').html(datavalue)

})
 
