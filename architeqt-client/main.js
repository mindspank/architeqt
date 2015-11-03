/* global $ */
(function() {

/**
 * Initial setup and event binding
 */

// Instaniate the API - sugar for REST endpoints.
// Supply port, if changed from default config change the port below to correspond to your settings.
var api = new Architeqt(3000);

// Set up the Blueprint and Children list.
populateBlueprintList();
populateChildrenList();

// Initiate full sync
$('#fullsync').on('click', fullSync);

// Switch view when a blueprint or child is clicked
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

/** 
 * End of initial setup and event binding
 */

function populateBlueprintList() {
	api.getBlueprint().then(function(data) {	
		var html = $(data.map(function(d) {
			return '<li id="' + d.id + '" class="blueprint">' + d.name + '</li>'
		}).join('\n'));
		
		$('#blueprintlist').empty().append(html);	
	});
}

function populateChildrenList() {
	api.getChildren().then(function(data) {	
		var html = $(data.map(function(d) {
			return '<li id="' + d.id + '" class="child">' + d.name + '</li>'
		}).join('\n'));
		
		$('#childrennavlist').empty().append(html);
	});	
};

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
			$('.children h2').text(e.target.innerHTML + ' inherits from the following blueprints.');
			
			var blueprints = data.reduce(function(a,b) {
				return a.concat(b)
			}, []).map(function(d) {
				return '<li id="' + d.id + '"><input type="checkbox"></input>' + d.name + '</li>';
			}).join('\n');
			
			var $button = $('<button>').text('Sync all blueprints to app');
			$button.on('click', function(){
				api.syncChild(e.target.id)
			})
			
			var $remove = $('<button>').text('Purge selected blueprints from app');
			$remove.on('click', function(){
				if(!$('input:checked').length) {
					return null;
				}
				// Beware - jquery map so swapped parameters
				var blueprintsToPurge = $('input:checked').map(function(i, d) {
					return $(d).parent().attr('id')
				});
				popover.showSpinner()
				api.removeChildFromBlueprint($('.active').attr('id'), blueprintsToPurge.toArray())
				.then(function() {
					$('input:checked').parent().remove();
					populateChildrenList();
					popover.hideSpinner();
					$('.content').append('<h2>Success</h2><p class="subheading">All blueprints has been successfully deleted.')
					$('.content').append('<button onClick="popover.hide()">Close</button>');
				})
				
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

}())