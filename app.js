
	//Type in a musician name (validate, store name, get ID).
	//Get all songs (start with the first 100. Kinda validate)
	//combine all lyrics into one big batch.
	var apikey = "7b85fdc3cf5e9561c3665ba9fa556318";
	var url = "http://api.musixmatch.com/ws/1.1/";
	var _artistID;
	var _lyrics;
	var e = "";
	var express = require('express');
	var app = express();

	var artistObj = {};
	var albumsObj = {};
	app.use('/Chart',express.static('Chart'));
	app.set('view engine','ejs');

	var jsdom = require('jsdom/lib/old-api');
	jsdom.env("", function(err,window){
		if(err) {
			console.error(err);
			return;
		}
		var $ = require("jquery")(window);

		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		$.support.cors = true;
		$.ajaxSettings.xhr = function (){
			return new XMLHttpRequest;
		}



	function getArtistID(artist){
		artistObj['name'] = artist;
		var finished = false;
		console.log("------------- GET ARTIST ID -------------");
		var artist = artist.split(' ').join('%20');
		console.log(artist);
		var query = url + "artist.search?apikey=" + apikey + "&q_artist=" + artist + "&page_size=1";

		$.ajax({
			url: query,
			dataType: 'json',
			success:function(data){
				_artistID=data.message.body.artist_list[0].artist.artist_id;

				artistObj['artist_id'] = data.message.body.artist_list[0].artist.artist_id;
				console.log(data.message.header.available);
				getArtistSongs();
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('error ' + textStatus + " " + errorThrown);
			}
		});
		console.log("------------- GET ARTIST ID -------------");
	}

	function getArtistSongs(){
		var songs = {};
		console.log("------------- GET ARTIST SONGS -------------");
		var query = url + "track.search?apikey=" + apikey + "&f_artist_id="+ _artistID +"&f_lyrics_language=en&f_has_lyrics=true&s_track_rating=desc&page_size=100";
		var wholeSet;
		var fixedSet = [];
		$.ajax({
			url:query,
			dataType: 'json',
			success: function (data){
			wholeset = data.message.body.track_list;
			$.each(wholeset,function(i,el){ //need to filter out the trash. Genius doesn't have so user submissions. Consider.
				if (el.track.track_name.toLowerCase().indexOf("remix") <= 0
					&& el.track.track_name.toLowerCase().indexOf("live") <= 0
					&& el.track.track_name.toLowerCase().indexOf("acoustic") <= 0
					&& el.track.track_name.toLowerCase().indexOf("edit") <= 0
					&& el.track.track_name.toLowerCase().indexOf("mix") <= 0
					&& el.track.track_name.toLowerCase().indexOf("(") <= 0){
					fixedSet.push(el.track.track_share_url);
					songs[el.track.track_name] = {
													"album_id":el.track.album_id,
													"album_name":el.track.album_name,
													"url":el.track.track_share_url
					};
		//			songs[el.track.track_name][''] = el.track.track_share_url;
				}
			});

			artistObj['songs'] = songs;
			console.log(artistObj);
			scrapeLyrics(fixedSet);
		}

		})
		console.log("------------- GET ARTIST SONGS -------------");
	}

	function scrapeLyrics(songURLs){ //works atm
		console.log("------------- SCRAPE LYRICS -------------");
		var allLyrics = [];
		$.each(songURLs,function(i,el){
		$.ajax({
	     url: el,
	     dataType: 'text',
	     success: function(data) {
	          var elements = $("<div>").html(data)[0].getElementsByClassName("mxm-lyrics__content ");
	          $("<div>").text(elements);
	          allLyrics.push($(elements).text().split('\n').join(' '));
	          if(songURLs.length == allLyrics.length)
	          		combineLyrics(allLyrics);
	   		}
		});
		 });
		console.log("------------- SCRAPE LYRICS -------------");
	}

	function combineLyrics(lyricList){
		_lyrics = lyricList.join(' ');
		tryUnderstand(_lyrics);

		console.log(count(_lyrics));
		console.log("Lyrics are now processing");
	}

	function count(str){
	  var obj={};
		str.split("?").join(" ");
		str.split("!").join(" ");
		str.split(".").join(" ");
	  str.split(" ").forEach(function(el,i,arr){
	    obj[el]=  obj[el]? ++obj[el]: 1;
	  });
	  return obj;
	}
	console.log(count("olly olly in come free"));


//track.search?format=jsonp&callback=callback&q_artist=Sam%20Smith&f_lyrics_language=en&f_has_lyrics=true&apikey=7b85fdc3cf5e9561c3665ba9fa556318
	function getArtistAlbums(){
		var artistID = "33491428";
		var query = url + "artist.albums.get?apikey=" + apikey + "&artist_id=" + artistID + "&page_size=99";
		var wholeSet;
		var fixedSet = [];

		$.getJSON(query,function(data){
			wholeset = data.message.body.album_list;
			$.each(wholeset, function(i, el){
	    		if($.inArray(el, fixedSet) === -1) fixedSet.push(el);
			});
			console.log(fixedSet[0]);
		});
	}


var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var nlu = new NaturalLanguageUnderstandingV1({
	username: "d815d5da-48d5-411d-8c39-adfdc3ab19fc",
  password: "gbwYXQkUYb1Q",
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

function tryUnderstand(){
	var options = {
      html: _lyrics,
      features: {
        concepts: {},
        keywords: {},
		emotion: {}
      }
};


    nlu.analyze(options, function(err, res) {
      if (err) {
        console.log("dexerra " +err);
        return;
      }
			var dataset = [];
      //console.log(res);
			var emotionalData = res.emotion.document.emotion;
	  console.log(console.log(Object.keys(emotionalData)));
		e = "name,";
		$.each(Object.keys(emotionalData),function (i,el){
			if (i != 0)
				e = e + "," + el;
				else {
					e = e + el;
				}
		});
		console.log(artistObj.name);
		e = e + "%" + artistObj.name + ",";
		$.each(Object.values(emotionalData),function (i,el){
			if (i != 0)
				e = e + "," + el;
				else {
					e = e + el;
				}
		});
		console.log(e);
    });
  }
getArtistID("Leonard Cohen");
	app.get('/index',function(req,res){
		var cheeky = e;

	  res.render('index',{cheeky});
	});


app.listen(8080);
});
