(function() {

var api = new Architeqt(3000);
api.getBlueprint().then(function(data) {
	
	var html = $(data.map(function(d) {
		return '<li id="' + d.id + '">' + d.name + '</li>'
	}).join('\n'));
	
	$('#blueprintlist').empty().append(html);
});

$('#fullsync').on('click', function() {
	api.fullSync()
	.done(function(data) {
		console.log(data)
	})
	.fail(function(error) {
		console.log(error)
	})
	.always(function() {
		
	})
})

$('#blueprintlist').on('click', 'li', function(e) {
	api.getChildrenOfBlueprint($(e.target).attr('id')).then(function(data) {
		
		var children = $(data.map(function(d) {
			return '<li id="' + d.id + '">' + d.name + '</li>'
		}).join('\n'));
		
		$('#childlist').empty().append(children)
		
	})
})

}())