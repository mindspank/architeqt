var popover = {
	hide: function() {
		$('.popover').css('display', 'none')
	},
	hideSpinner: function() {
		$('.spinner').css('display', 'none')		
	},
	showSpinner: function() {
		$('.popover').find('.content').empty()
		$('.popover').css('display', 'flex')
		$('.spinner').css('display', 'flex')		
	},
	show: function(message) {
		this.hideSpinner();
		$('.popover').find('.content').empty()
		$('.popover .content').append('p').text(message || 'Loading...')
		$('.popover').css('display', 'flex')
	},
	error: function(message) {
		$('.spinner').css('display', 'none');		
		$('.popover').find('.content').css('text-align', 'center').append('<p class="error">' + (message || 'Sad Panda') + '</p><img src="sad_panda.jpg"></img>')
		$('.popover').css('display', 'flex')
	}
}