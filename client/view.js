//from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
	sParameterName,
	i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};


$.getJSON("load", { id: getUrlParameter('id') }, function (groups) {
	$("#loading").hide();
	for (var i = 0; i < groups.length; i++) {
		$("#multi").append("\
<div class='col-sm-2 studentGroup'>\
	<div class='panel panel-default'>\
		<div class='panel-heading'>" + groups[i].name + "</li></div>\
		<div class='panel-body'>\
			<ul class='list-group' id='" + groups[i].id + "'>\
			</ul>\
		</div>\
	</div>\
</div>");
		for (var j = 0; j < groups[i].students.length; j++) {
       			$('#' + groups[i].id).append("<li class='list-group-item'>" + groups[i].students[j] + "</li>");
		}
	}})
	.fail(function() {
		$("#loading").hide();
		$("#error").show();
	});
