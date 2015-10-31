/* global $ */
(function() {

var api = new Architeqt(3000);
api.getBlueprint().then(function(data) {
	
	var html = $(data.map(function(d) {
		return '<li id="' + d.id + '" class="blueprint">' + d.name + '</li>'
	}).join('\n'));
	
	$('#blueprintlist').empty().append(html);
});
api.getChildren().then(function(data) {
	
	var html = $(data.map(function(d) {
		return '<li id="' + d.id + '" class="child">' + d.name + '</li>'
	}).join('\n'));
	
	$('#childrennavlist').empty().append(html);
});

$('#fullsync').on('click', fullSync)

$('.blueprints').on('click', 'li', function(e) {
	var toggle = listToggle(e);
	if(toggle) return;
	
	if($(e.target).hasClass('blueprint')) {
		fetchBlueprint(e)
	}
	if($(e.target).hasClass('child')) {
		fetchBlueprintForChild(e)
	}
	

});

function listToggle(e) {
	if( $(e.target).hasClass('active') ) {
		$(e.target).removeClass('active');
		$('.children h2').text('Select a Blueprint/Child or perform a full sync');
		$('#childlist').empty();
		return true;
	} else {
		$('.blueprints').find('.active').removeClass('active');
		$(e.target).addClass('active');
		return false
	}
};

function fetchBlueprintForChild(e) {
	api.getBlueprintsForChild( e.target.id ).then(function(data) {
		if(data.length) {
			$('.children h2').text(e.target.innerHTML + ' inherits from the following Blueprints.');
			
			var blueprints = data.reduce(function(a,b) {
				return a.concat(b)
			}, []).map(function(d) {
				return '<li id="' + d.id + '"><input type="checkbox"></input>' + d.name + '</li>';
			}).join('\n');
			
			var $button = $('<button>').text('Sync Blueprints');
			$button.on('click', function(){
				api.syncChild(e.target.id)
			})
			
			var $remove = $('<button>').text('Remove selected Blueprints');
			$button.on('click', function(){
				var checked = $('input:checked');
				if(!checked.length) {
					return null;
				}
				
				
				
			})
			
			$('#childlist').empty().append( $(blueprints) ).append($button).append($remove);
		
		} else {
			
		}		
	})
}

function fetchBlueprint(e) {
	api.getChildrenOfBlueprint( e.target.id ).then(function(data) {
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
	});
};

function fullSync() {
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
};

function getCount(msg) {
	return $('input:checked').length;
}

}())