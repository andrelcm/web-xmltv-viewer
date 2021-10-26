moment.locale(navigator.language || navigator.userLanguage);
var count = 0;
var reader;
var today = moment().startOf("day");
var day = moment(today).startOf("day");
var endDay = moment(day).endOf("day");
var xml = null;

//console.log(day.toDate());
//console.log(endDay.toDate());

//var localeData = moment.localeData(navigator.language || navigator.userLanguage);
//console.log(localeData);
//var format = localeData.longDateFormat('L');

function updateDate() {
  //console.log("update date");
  
  //console.log(day.format());
  //console.log(endDay.format());

  var content ='<span id="previousDate" class="date-nav'+(day.isSame(today) || xml == null? ' disabled' : '')+'">&laquo;</span>';
  content    +='<span> '+day.format('L')+' </span>';
  content    +='<span id="nextDate" class="date-nav'+(xml == null? ' disabled' : '')+'">&raquo;</span>';

  $(".guide-date").empty();
  $(".guide-date").append(content);

  if(xml != null) {
    if(!day.isSame(today)) {
      $(".guide-date").find("#previousDate").click(function (){
        //console.log("previous");
        day.add(-1, 'days');
        eraseListings();
        endDay = moment(day).endOf("day");
        updateDate();
      });
    }
    $(".guide-date").find("#nextDate").click(function (){
        //console.log("next");
        day.add(1, 'days'); 
        eraseListings();
        endDay = moment(day).endOf("day");
        updateDate();
      });
  }
}

function eraseListings() {
  //console.log("erase listings");
  $(document).find('td[colspan="48"]').each(function(){
    $(this).empty();
  });
  installChannelObserver();
}

//var progress = document.querySelector('.percent');

function abortRead() {
    reader.abort();
}

function errorHandler(evt) {
    switch(evt.target.error.code) {
        case evt.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
        case evt.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
        case evt.target.error.ABORT_ERR:
            break; // noop
        default:
            alert('An error occurred reading this file.');
    };
}

function updateProgress(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100) {
            //progress.style.width = percentLoaded + '%';
            //progress.textContent = percentLoaded + '%';
        }
    }
}

function handleFileSelect(evt) {
  eraseAll();
    // Reset progress indicator on new file selection.
    //progress.style.width = '0%';
    //progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
        alert('File read cancelled');
    };
    reader.onloadstart = function(e) {
        //document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(event) {
        // Ensure that the progress bar displays 100% at the end.
        //progress.style.width = '100%';
        //progress.textContent = '100%';
        //setTimeout("document.getElementById('progress_bar').className='';", 2000);
        var contents = event.target.result;
        xmlDoc = $.parseXML(contents);
        $xml = $( xmlDoc );
        xml = $xml;
        processXML();
        
    };
    reader.readAsText(evt.target.files[0]);
}

function programme(id,logo,name) {
  var content = '';
  xml.find("programme[channel='"+id+"']").each(function(){

  var startTime = moment($(this).attr("start"), "YYYYMMDDHHmmss Z");
  var endTime = moment($(this).attr("stop"), "YYYYMMDDHHmmss Z");
  var endTimeShow = moment(endTime);

  if(endTime.isAfter(endDay)) {
    endTimeShow = endDay;
  }

  //console.log(startTime.toDate());
  //console.log(endTime.toDate());

  if(moment(startTime).isBetween(day, endDay, null, '[]')) {
    //console.log(startTime.format("HH:mm"));
    //console.log(endTime.format("HH:mm"));
    //console.log($(this));

    //var temp = Date.now();s
    //var duration = moment(temp - moment.duration(endTime.diff(startTime)).valueOf()).from(temp,true);

    var start = moment.duration(startTime.diff(day)).valueOf() / 60000;
    duration = moment.duration(endTime.diff(startTime)).valueOf() / 60000;
    var durationShow = moment.duration(endTimeShow.diff(startTime)).valueOf() / 60000;

    var title = $(this).find('title').text();
    var subtitle='';
    var description='';
    var icon='';
    var episode = '';
    var rating = '';
    var starrating = '';
    var director = '';
    var actor = '';
    var category = '';

    if($(this).find('sub-title').length) {
      subtitle = $(this).find('sub-title').text();
    };
    if($(this).find('desc').length) {
      description = $(this).find('desc').text();
    };        
    if($(this).find('icon').length) {
      if($(this).find('icon').attr("src")) {
        icon = $(this).find('icon').attr("src");
      }
    };
    if($(this).find('episode-num').length) {
      if($(this).find('episode-num').attr("system") && $(this).find('episode-num').attr("system") == "onscreen") {
        episode = $(this).find('episode-num').text();
      }
    };
    if($(this).find('rating').length) {
      if($(this).find('rating').find("value").length) {
        rating = $(this).find('rating').find("value").text();
      }
    };
    if($(this).find('star-rating').length) {
      if($(this).find('star-rating').find("value").length) {
        starrating = $(this).find('star-rating').find("value").text();
      }
    };

    if($(this).find('credits').length) {
      $(this).find('credits').find("director").each(function(){
        director += $(this).text() + ', ';
      });
      if(director.length  >= 2)
        director = director.substring(0, director.length - 2);

      $(this).find('credits').find("actor").each(function(){
        actor += $(this).text() + ', ';
      });
      if(actor.length  >= 2)
        actor = actor.substring(0, actor.length - 2);
      
    };

    $(this).find("category").each(function(){
        category += $(this).text() + ' / ';
    });
    if(category.length  >= 3)
      category = category.substring(0, category.length - 3);
    
    content+='<div class="guide-programme" style="left: '+(start*5)+'px; width: '+(durationShow*5)+'px;">';
    content+='<div class="guide-programme-container">';
    content+='<div><button type="button" class="btn btn-link guide-programme-title" data-toggle="modal" data-target="#programme-'+count+'">'+title+'</button></div>';
    content+='<div class="guide-programme-hour">'+(startTime.format("HH:mm"))+'-'+(endTime.format("HH:mm"))+'</div>';
    content+='<div class="guide-programme-episode">'+episode+'</div>';
    content+='<div class="guide-programme-container2">';
    content+='<div class="guide-programme-imageholder">'+(icon != '' ? '<img src="'+icon+'" class="img-fluid guide-programme-image" loading="lazy">' : '')+'</div>';
    content+='<div class="guide-programme-rating"><span class="badge badge-primary">'+rating+'</span></div>';        
    content+='</div>';
    content+='</div>';
    content+='</div>';
    content+='<div class="modal fade" id="programme-'+count+'" tabindex="-1" role="dialog" aria-labelledby="programmeLabel-1" aria-hidden="true">';
    content+='<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">';
    content+='<div class="modal-content">';
    content+='<div class="modal-header">';
    content+='<h5 class="modal-title" id="programmeLabel-1">'+title+'</h5>';
    content+='<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    content+='<span aria-hidden="true">&times;</span>';
    content+='</button>';
    content+='</div>';
    content+='<div class="modal-body">';
    content+='<div class="row">';
    content+='<div class="col">';
    content+='<div class="row row-cols-2 row-cols-md-4">';
    content+='<div class="col"><strong>Channel:</strong></div>';
    content+='<div class="col text-right" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">'+name+'</div>';
    content+='<div class="col">'+(episode != '' ? '<strong>Episode:</strong>' : '')+'</div>';
    content+='<div class="col text-right" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">'+episode+'</div>';
    content+='<div class="col"><strong>Start time:</strong></div>';
    content+='<div class="col text-right">'+(startTime.format("HH:mm"))+'</div>';
    content+='<div class="col"><strong>End time:</strong></div>';
    content+='<div class="col text-right">'+(endTime.format("HH:mm"))+'</div>';
    content+='<div class="col"><strong>Duration:</strong></div>';
    content+='<div class="col text-right">'+duration+' minutes</div>';
    content+='<div class="col">'+(rating != '' ? '<strong>Rating:</strong>' : '')+'</div>';
    content+='<div class="col text-right" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"><span class="badge badge-primary">'+rating+'</span></div>';
    content+='<div class="col">'+(subtitle != '' ? '<strong>Subtitle:</strong>' : '')+'</div>';
    content+='<div class="col text-right" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">'+subtitle+'</div>';
    content+='<div class="col">'+(starrating != '' ? '<strong>Star rating:</strong>' : '')+'</div>';
    content+='<div class="col text-right" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">'+starrating+'</div>';        
    content+='</div>   ';
    content+='</div>';
    content+='<div class="col-auto">';
    content+='<div class="guide-channel text-center" style="width: 80px;">' + (logo != '' ? '<img src="'+logo+'" class="img-fluid guide-channel-image">' : '') + '</div>';
    content+='</div>';
    content+='</div>';
    content+='<div class="row border-top">';
    content+='<div class="col">';
    content+=description;
    content+='</div>';
    content+='<div class="col-auto">';
    content+='<div class="guide-channel text-center" style="width: 150px;">'+(icon != '' ? '<img src="'+icon+'" class="img-fluid ">' : '')+'</div>';
    content+='</div>';
    content+='</div>';
    if(director != '' || actor != '' || category != '') {
      content+='<div class="row border-top">';
      content+='<div class="col">';
      content+='<div class="row row-cols-2">';
      content+='<div class="col">'+(category != '' ? '<strong>Category:</strong>' : '')+'</div>';
      content+='<div class="col">'+category+'</div>';            
      content+='<div class="col">'+(director != '' ? '<strong>Director:</strong>': '')+'</div>';
      content+='<div class="col">'+director+'</div>';
      content+='<div class="col">'+(actor != '' ? '<strong>Actors:</strong>' : '')+'</div>';
      content+='<div class="col">'+actor+'</div>';
      content+='</div>   ';
      content+='</div>';
      content+='</div>';
    }
    content+='</div>';
    content+='<div class="modal-footer">';
    content+='<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>';
    content+='</div>';
    content+='</div>';
    content+='</div>';
    content+='</div>';
  };

  count++;

  });
  return content;
}

function processXML() {

  var content = "";
  $channel = xml.find( "channel" ).each(function(){
    var id = $(this).attr("id");
    var name = $(this).find('display-name').text();
    var logo = "";


    if($(this).find('icon').length) {
      if($(this).find('icon').attr("src")) {
        logo = $(this).find('icon').attr("src");
      }
    }

    content+='<tr>';
    content+='<td><div class="guide-channel text-center" channelid="'+id+'">' + (logo != '' ? '<img src="'+logo+'" class="img-fluid guide-channel-image" loading="lazy">' : '') + '<div class="guide-channel-name">'+name+'</div></div></td>';
    content+='<td colspan="48">';
    content+='</td>';
    content+='</tr>';
    });

    $("#guide-body").append(content);
    updateDate();
    installChannelObserver();
}

function installChannelObserver() {
  const config = {
      rootMargin: '0px 0px 0px 0px',
      threshold: 0
    };

    let observer = new IntersectionObserver(function(entries, self) {
      // iterate over each entry
      entries.forEach(entry => {
        if(entry.isIntersecting) {

          //console.log(entry.target);

          var id = $(entry.target).attr("channelid");
          var logo = '';
          var name = $(entry.target).find(".guide-channel-name").text();

          if($(entry.target).find('img').length) {
            if($(entry.target).find('img').attr("src")) {
              logo = $(entry.target).find('img').attr("src");
            }
          }


          //console.log(id);
          //console.log(name);
          //console.log(logo);

          //console.log($(entry.target).parent().next().get());

          $(entry.target).parent().next().append(programme(id,logo,name));

          self.unobserve(entry.target);
        }
      });
    }, config);
    const channels = document.querySelectorAll('[channelid]');
    channels.forEach(c => {
      observer.observe(c);
    });  
}

function eraseAll() {
  //console.log("erase all");
  $("#guide-body").empty();
  var endDay = moment(day).endOf("day");
  updateDate();
}


document.getElementById('file').addEventListener('change', handleFileSelect, false);
$(".load-example").click(function () {
  eraseAll();
  //console.log("load example");


  $.ajax({
    type: 'GET',
    dataType: 'binary',
    url: "guide.xml.gz",
    cache: true,
    error: function (xhr, ajaxOptions, thrownError) {
        console.log(thrownError);
        $('#loading').on('shown.bs.modal', function (e) {
          $('#loading').modal('hide');
        });
        $('#loading').hide('hide');
        //console.log("hidden");
        $('#errorLoading').modal('show');
    },
    xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        //Download progress
        xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                //console.log(percentComplete);
                //progressElem.html(Math.round(percentComplete * 100) + "%");
                $("#progress-bar").css("width",Math.round(percentComplete * 100) + "%");
            }
        }, false);
        xhr.addEventListener('load',function(){
          //console.log("load");
          if (xhr.status === 200){
            var byteArray = new Uint8Array(xhr.response);
            var contents = pako.inflate(byteArray, {to: 'string'});
            byteArray = null;
            contents = '<?xml version="1.0" encoding="UTF-8"?>' + contents.replace(/[\w\W]+?\n+?/,"");
            //console.log(contents);
            //parser = new DOMParser();
            //xmlDoc = parser.parseFromString(contents,"text/xml");
            xmlDoc = $.parseXML(contents);
            $xml = $( xmlDoc );
            xml = $xml;
            //console.log(xml.text());
            processXML();
            $('#loading').on('shown.bs.modal', function (e) {
              $('#loading').modal('hide');
            });      
            $('#loading').modal('hide');            
          }
        });
        return xhr;
    },
    beforeSend: function () {
      $('#loading').off('shown.bs.modal');
      $('#loading').modal('show');
    },/*
    complete: function (e) {
      console.log("complete");
      //console.log([e]);
      //console.log(e);
      //var byteArray = new Uint8Array([e]);
      //console.log(byteArray.length);
      //var contents = pako.inflate(byteArray, {to: 'string'});
      //console.log(contents);
      //xmlDoc = $.parseXML(new TextDecoder("utf-8").decode(contents));
      //$xml = $( xmlDoc );
      //xml = $xml;
      //console.log(xml);
      //processXML();
      $('#loading').on('shown.bs.modal', function (e) {
        $('#loading').modal('hide');
      });      
      $('#loading').modal('hide');
    },*/
    success: function (json) {
      //console.log("data receieved");
      $("#progress-bar").css("width","100%");
    }
});
});

updateDate();