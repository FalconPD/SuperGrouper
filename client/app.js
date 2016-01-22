const MAXGROUPS=1024;

/**
 *  * Randomize array element order in-place.
 *   * Using Durstenfeld shuffle algorithm.
 *    */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

//Go through all the groups and return an array of groups with
//a student array element and an id
function refreshGroups() {
	var groups = [];

	$('.list-group').each(function(i, group) {
		groups.push({
			name:group.getAttribute("data-name"),
			id:group.id,
			students:[]});
		$('#' + group.id + ' > .list-group-item').each(function(j, student) {
			groups[i].students.push(student.innerHTML.slice(0, -26));
		});
	});

	return groups;
}

//For now groups names are just Group N, but it would be cool to have some
//options, like animals, fruits, places... etc.
function addGroup() {

	var unusedNumber;

	var groups = refreshGroups();
	if (! groups.length) {
		unusedNumber = 1;
	}
	else {
		//Find the lowest unused number we can
		//Remember our group numbers start at one
		for (unusedNumber = 1; unusedNumber < MAXGROUPS; unusedNumber++) {
			for (i = 0; i < groups.length; i++) {
				if (Number(groups[i].id.replace("Group", "")) == unusedNumber) {
					break;
				}
			}
			if (i == groups.length) {
				break;
			}
		}
	}
	var groupName = "Group " + unusedNumber;
	var groupID = "Group" + unusedNumber;

	$("#multi").append("\
<div class='col-sm-2 studentGroup'>\
	<div class='panel panel-default'>\
		<div class='panel-heading'>" + groupName + "<i class='js-remove'>✖</i></li></div>\
		<div class='panel-body'>\
			<ul data-name='" + groupName + "' class='list-group' id='" + groupID + "'>\
			</ul>\
		</div>\
	</div>\
</div>");

	Sortable.create($('#' + groupID)[0], {
		group: 'students',
		animation: 150,
		filter: '.js-remove',
		onFilter: function (evt) {
			evt.item.parentNode.removeChild(evt.item);
		}
	});

	$(".panel-heading .js-remove").on("click", removeGroup);
	return $('#' + groupID);
}

function addStudent(eventObject, studentName) {

	studentName = studentName || $('#studentName').val();
	if (! studentName) { //don't allow empty students
		return;
	}

	var groups = refreshGroups();
	if ( ! groups.length ) { //Don't have any groups yet, make one and use it
		var smallestElement = addGroup();
	}
	else {
		//Find the smallest group
		var smallestLength = groups[0].students.length;
		var smallestElement = $('#' + groups[0].id); //default to the first group if they're all equal
		var currentLength;
		for (var i = 0; i < groups.length; i++)	{
			currentLength = groups[i].students.length;
			if (currentLength < smallestLength) {
				smallestLength = currentLength;
				smallestElement = $('#' + groups[i].id);
			}
		}

		//make a new group if the smallest is still >= the max group size
		if (smallestLength >= $('#groupSize').val()) {
			smallestElement = addGroup();
		}
	}

       	smallestElement.append("<li class='list-group-item'>" + studentName + "<i class='js-remove'>✖</i></li>");
}

function removeGroup() {
	$(this).parent().parent().parent().remove();
}

//this gets called when the dropdown box is clicked.
function loadClass() {
	
	//put up our loading modal
	$("#loadingModal").modal();

	//remove all the old groups
	$('.studentGroup').remove();

	classID = $(this).attr('id').slice(5);
	var request = gapi.client.request({
		root: 'https://classroom.googleapis.com',
		path: 'v1/courses/' + classID + '/students',
	});

	request.execute(function(resp) {
		if (resp.error) {
			error("Unable to load students from class.");
		}
		else {
			var students = [];

			for (var i = 0; i < resp.students.length; i++) {
				//Just use the first name and last initial for privacy 
				students.push(resp.students[i].profile.name.givenName + " " +
						resp.students[i].profile.name.familyName.charAt(0));
			}
			shuffleArray(students); //scramble the students array so the groups are random
			for (var i = 0; i < students.length; i++) {
				addStudent(null, students[i]);
			}
		}
		//hide our loading modal
		$("#loadingModal").modal("hide");
	});
}

//TODO: proper paging
function onSignIn(googleUser) {

        var request = gapi.client.request({
		root: 'https://classroom.googleapis.com',
		path: 'v1/courses',
		params: {
			pageSize: 0
		}
	});

        request.execute(function(resp) {
		if (resp.error) {
			var msg;

			error("Unable to get course list. Is this account signed up for Google Classroom?");
		}
		else {
			for (var i = 0; i < resp.courses.length; i++) {
				if ( resp.courses[i].courseState = "ACTIVE") {
					$("#classesDropdown").append("<li><a href='#' id='class" + resp.courses[i].id + "'>" + resp.courses[i].name + "</a></li>");
				}
			}
		}
	});
}

function shareToClassroom() {
	groups = refreshGroups();
	$.ajax({
		type: 'POST',
		data: JSON.stringify(groups),
		contentType: 'application/json',
		url: 'save',						
		success: function(uuid) {
			window.location = "https://classroom.google.com/share?url=http://teach.using.tech/SuperGrouper/view.html?id=" + uuid;
		}
	});
}

function error(msg) {
	$('body').prepend("<div class='alert alert-danger'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><strong>Error: </strong>" + msg + "</div>");
}

//Event handlers
$("#addStudent").click(addStudent);
$("#addGroup").click(addGroup);
$("#shareToClassroom").click(shareToClassroom);
$("#classesDropdown").on("click", "li a", loadClass);

//Make the groups dragable
Sortable.create($('#multi')[0], {
	animation: 150,
	draggable: '.studentGroup',
	handle: '.panel-heading'
});

//Activate all the tooltips
//$('[data-toggle="tooltip"]').tooltip();
