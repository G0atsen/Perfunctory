
	//Type in a musician name (validate, store name, get ID).
	//Get all songs (start with the first 100. Kinda validate)
	//combine all lyrics into one big batch.
	var express = require('express');
	var app = express();

app.use('/Chart',express.static('Chart'));
app.set('view engine','ejs');

app.get('/index',function(req,res){
  var que = 12;
  res.render('index',{que})
});


app.listen(3000);
