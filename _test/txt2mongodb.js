var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/quiz');

require('../libs/question.js');
mongoose.model('Question', QuestionSchema);
var Question = db.model('Question');

var fs = require('fs');
fs.readFile('questions.txt', function(err, data){
//console.log(data.length)
    var lines = data.toString().split("\n");
    lines.forEach(function(el, i){
	var qa = el.split("|");
	if (qa.length == 2) {
	    var q = new Question();
	    q.quest = qa[0];
	    q.answer = qa[1];
	    q.save();
	}
    });
    console.log("fin");
});
