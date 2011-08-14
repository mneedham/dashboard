exports.parse = function(commitMessage){
	function capitalise(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
    var people =  commitMessage.match(/(.*)\/([^ ]*)/);
    return [capitalise(people[1]), capitalise(people[2])];
};
