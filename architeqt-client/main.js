(function() {

var api = new Architeqt(3000);
api.getBlueprint().then(function(data) {
	
	var html = $(data.map(function(d) {
		return '<li id="' + d.id + '">' + d.name + '</li>'
	}).join('\n'));
	
	$('#blueprintlist').empty().append(html);
});

$('#fullsync').on('click', function() {
	popover.showSpinner();
	api.fullSync()
	.done(function(data) {
		popover.hideSpinner();
		$('.content').append('<h2>Success</h2><p class="subheading">All blueprints has been successfully synced.')
		$('.content').append('<button onClick="popover.hide()">Close</button>');
	})
	.fail(function(error) {
		console.log(error)
	})
	.always(function() {
		
	})
})

$('#blueprintlist').on('click', 'li', function(e) {
	if( $(e.target).hasClass('active') ) {
		$(e.target).removeClass('active');
		$('.children h2').text('Select a Blueprint');
		$('#childlist').empty();
		return;
	}
		
	$('#blueprintlist').find('.active').removeClass('active');
	$(e.target).addClass('active');
	

	api.getChildrenOfBlueprint($(e.target).attr('id')).then(function(data) {
		if(data.length) {
			$('.children h2').text(e.target.innerHTML + ' is associated to the following children.');
			
			var children = $(data.map(function(d) {
				return '<li id="' + d.id + '">' + d.name + '</li>'
			}).join('\n'));
			
			var $button = $('<button>Sync Blueprint</button>');
			$button.on('click', function(){
				api.syncBlueprint($('.active').attr('id')).then(function() {
					$('#childlist').append('<h2>Sync Successful</h2>');
				})
			})
			
			$('#childlist').empty().append(children).append($button);			
		} else {
			$('.children h2').text('No children associated with ' + e.target.innerHTML);
			$('#childlist').empty();
		}
				
	})
	.fail(function(err) {
		$('.children h2').text('Oops, something when wrong when fetching the children. Please reload the page.');
		$('#childlist').empty();
	})
})

}())