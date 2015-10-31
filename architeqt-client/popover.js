var popover = {
	hide: function() {
		$('.popover').css('display', 'none')
	},
	hideSpinner: function() {
		$('.spinner').css('display', 'none')		
	},
	showSpinner: function() {
		$('.spinner').css('display', 'flex')		
	},
	show: function(message) {
		$('.popover').find('.content').empty()
		$('.popover').find('p').text(message || 'Loading...')
		$('.popover').css('display', 'flex')
	},
	error: function(message) {
		$('.spinner').css('display', 'none');		
		$('.popover').find('.content').css('text-align', 'center').append('<p class="error">' + (message || 'Sad Panda') + '</p><img src="sad_panda.jpg"></img>')
		$('.popover').css('display', 'flex')
	}
}