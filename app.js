
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
	var _async = require('async')
	var artistObj = {};
	var albumsObj = {};
	var numberOfSongs = 0;
	var ready = false;
	var response;
	var flagDoneEmotions = 0;
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
			async: false,
			success:function(data){
				_artistID=data.message.body.artist_list[0].artist.artist_id;
				artistObj['artist_id'] = data.message.body.artist_list[0].artist.artist_id;
				console.log("Moving on to get artist songs");
				//getArtistAlbums();
				return;
				//getArtistSongs();
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('error ' + textStatus + " " + errorThrown);
			}
		},callback);
		console.log("------------- GET ARTIST ID -------------");
	}

function callback(){
	console.log("reeee");
}
	function getArtistAlbums(){
		var albums = {};
		console.log("------------- GET ARTIST ALBUMS -------------");
		var query = url + "artist.albums.get?apikey=" + apikey + "&artist_id="+ _artistID +"&s_release_date=desc&g_album_name=1&page_size=100";
		var wholeset;
		$.ajax({
			url:query,
			dataType: 'json',
			success: function (data){
			wholeset = data.message.body.album_list;
			$.each(wholeset,function(i,el){
				console.log(el.album.album_id);
					albums[el.album.album_id] = {
						"album_name":el.album.album_name,
						"album_release_date":el.album.albume_release_date
					};
			});
		//	artistObj['albums'] = albums;
			albumsObj = albums;
			console.log(albumsObj);
			getArtistSongs();
			//scrapeLyrics(fixedSet);
		}

		})
		console.log("------------- GET ARTIST ALBUMS -------------");
	}


function getAlbumSongs(){
	var songs = {};
	console.log("------------- GET ARTIST SONGS -------------");
	var query = url + "album.tracks.get?apikey=" + apikey + "&f_artist_id="+ _artistID +"&f_lyrics_language=en&f_has_lyrics=true&s_track_rating=desc&page_size=100";
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
		$.each(songs,function(i,el){
			console.log(el.album_id);
			albumsObj[el.album_id]['songs'][el] = {
				"url":el.url
			}
		});

		console.log("asd");
		console.log(albumsObj);
		artistObj['songs'] = songs;
		scrapeLyrics(fixedSet);
	}

	})
	console.log("------------- GET ARTIST SONGS -------------");
}

	function getArtistSongs(){
		var songs = [];
		console.log("------------- GET ARTIST SONGS -------------");
		var query = url + "track.search?apikey=" + apikey + "&f_artist_id="+ _artistID +"&f_lyrics_language=en&f_has_lyrics=true&s_track_rating=desc&page_size=100";
		var wholeSet;
		var fixedSet = [];
		$.ajax({
			url:query,
			dataType: 'json',
			async: false,
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
					songs.push({	"song_name" : el.track.track_name,
													"album_id":el.track.album_id,
													"album_name":el.track.album_name,
													"url":el.track.track_share_url
					});
		//			songs[el.track.track_name][''] = el.track.track_share_url;
			numberOfSongs++;
				}
			});

			var groupBy = function (xs, key) { //https://jsfiddle.net/tzz60j0a/ generalized json sort
			    return xs.reduce(function (rv, x) {
			        (rv[x[key]] = rv[x[key]] || []).push(x);
			        return rv;
			    },{});
			};
			albumsObj = groupBy(songs, 'album_id');
			//console.log(albumsObj);

			//console.log("asd");
			//console.log(albumsObj);
			//console.log(songs);
			artistObj['songs'] = songs;
			//console.log(artistObj);
			//scrapeLyrics(fixedSet);
			//scrapeByAlbum();
		}

		})
		console.log("------------- GET ARTIST SONGS -------------");
	}

function scrapeByAlbum(){
	console.log("scraping by album");
//	console.log(albumsObj);
	var temp = [];
	var counter = -1;
	var counter2 = -1;
 $.each(albumsObj,function (i,el){
	  counter++;
			albumsObj[i]["lyrics"] = " ";
		 //i is the name of the album
		 // el is the element
		 $.each(el,function(j,em){
			//j is the index
			// em is the element
			$.ajax({
				 url: em.url,
				 dataType: 'text',
				 async:false,
				 success: function(data) {
					 		counter2++;
							var elements = $("<div>").html(data)[0].getElementsByClassName("mxm-lyrics__content ");
							$("<div>").text(elements);
							albumsObj[i]["lyrics"] = 	albumsObj[i]["lyrics"] + $(elements).text().split('\n').join(' ');
							console.log(counter2 + " " + numberOfSongs);
							if (counter2 == numberOfSongs){
								//console.log(albumsObj);
								console.log("Done connecting lyrics to songs.");
								//getEmotions();
								//tryUnderstand(albumsObj[i].lyrics,albumsObj[i]);
							}
					},
					error: function(data){
									 counter2++;
						console.log("there has been an error in scrapeByAlbum");
					}

			});
		});
 });

}




	async function getEmotions(){
		$.each(albumsObj,function(i,el){
			el['emotions'] = " ";
			console.log(i + "+______________________________________________+");
			console.log(albumsObj[i]);
		if ( i != "undefined")
		  	el['emotions'] = tryUnderstand(el.lyrics,i);
		});
	};


function asyncEmotions(){
	return new Promise(function(resolve, reject) {
	var promises = [];
	_async.each(albumsObj,function(obj){
			obj['emotions'] = tryUnderstand(obj.lyrics,"hue");
			promises.push(obj['emotions']);
	});
	Promise.all(promises)
	.then(function(data){
		resolve(promises);
		console.log(promises);})
	.catch(function(err){console.log("error in asyncEmotions")})
});
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

	//	console.log(count(_lyrics));
		console.log("Lyrics are now processing");
	}

	function count(str){
	  var obj={};
		str.split("\'").join("");
		str.split("?").join("");
		str.split("!").join("");
		str.split(".").join("");
		str.split(",").join("");
		str.split("\\").join("");
		str.split("\"").join("");
	  str.split(" ").forEach(function(el,i,arr){
	    obj[el]=  obj[el]? ++obj[el]: 1;
	  });
	  return obj;
	}


//track.search?format=jsonp&callback=callback&q_artist=Sam%20Smith&f_lyrics_language=en&f_has_lyrics=true&apikey=7b85fdc3cf5e9561c3665ba9fa556318


var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var nlu = new NaturalLanguageUnderstandingV1({
	username: "d815d5da-48d5-411d-8c39-adfdc3ab19fc",
  password: "gbwYXQkUYb1Q",
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

function tryUnderstand(str,name,callback){
var promise;


			var options = {
		      html: str,
		      features: {
		        concepts: {},
		        keywords: {},
				emotion: {}
		      }
		};

	return new Promise(function(resolve, reject) {
		console.log('------ beginning analysis -------');
		    nlu.analyze(options, function(err, res) {
		      if (err) {
		        console.log("dexerra " + err);
						console.log(name);
						resolve("broked");
		        return;
		      }
					var dataset = [];
		      //console.log(res);
					var emotionalData = res.emotion.document.emotion;
			  console.log(Object.keys(emotionalData));
				e = "Name,";
				$.each(Object.keys(emotionalData),function (i,el){
					if (i != 0)
						e = e + "," + el;
						else {
							e = e + el;
						}
				});
				console.log(artistObj.name);
				e = e + "%" + name + ",";
				$.each(Object.values(emotionalData),function (i,el){
					if (i != 0)
						e = e + "," + el;
						else {
							e = e + el;
						}
				});
				flagDoneEmotions ++;
				if (flagDoneEmotions == Object.keys(albumsObj).length -1){
					ready=true;
					}
					console.log("done with analysis");
					resolve(e);
		    });

  });
}

	app.get('/index',function(req,res){

		getArtistID("Mumford and sons");
		console.log("Got artist ID");
		//console.log(albumsObj);
		getArtistSongs();
		console.log("got artist songs");
		//console.log(albumsObj);
		scrapeByAlbum();
		console.log("done the scrape");
		//console.log(albumsObj);
		asyncEmotions().then(function(){
			if (ready){
				var cheeky = e;
				console.log(albumsObj);
				res.render('index',{albumsObj});
			} else {
				var cheeky = e;
				 res.render('loading',{albumsObj});
			}
		});

	});


app.listen(8080);
});
