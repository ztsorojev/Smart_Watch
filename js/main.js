/*
 * Part of this code is taken from Google's Web Speech API
 * avaiable here: https://www.google.com/intl/en/chrome/demos/speech.html
 */

window.___gcfg = { lang: 'en' };
(function() {
  var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
  po.src = 'https://apis.google.com/js/plusone.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();


var final_transcript = '';
var final_transcript2 = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

var transcript;
var word;

var new_word = '';

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    //showInfo('info_speak_now');
    start_img.src = './lib/img/mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = './lib/img/mic.gif';
      //showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = './lib/img/mic.gif';
      //showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = './lib/img/mic.gif';
  };

  var edit_done = false; //becomes true when we changed a word


  recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      upgrade();
      return;
    } 
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        if(edit_done) {
          final_transcript = transcript.replace(word, new_word);
        } else {
          final_transcript += event.results[i][0].transcript;
        }
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);

    //if we speak while having selected a word
    if(document.getElementById("selected_word")) {
      new_word = (event.results[event.results.length-1][0].transcript).substr(1);
      selected_word.innerHTML = linebreak(new_word);  //remove 1st character of new_word because it's just empty space
      select_button.innerHTML = "Save";
      //console.log(final_span.innerHTML);
      edit_done = true;
    } else {
      //final_transcript2 = final_transcript.replace('<span id="selected_word" class="highlight">' + new_word + '</span>', new_word);
      final_span.innerHTML = linebreak(final_transcript);
      interim_span.innerHTML = linebreak(interim_transcript);
      edit_done = false;
      console.log(final_transcript);
    }

    // auto scroll down if there is a text overflow in box
    if (final_span.offsetHeight > text_box.offsetHeight) {
      console.log(text_box.scrollTop);
      console.log(text_box.scrollHeight);
      text_box.scrollTop = text_box.scrollHeight;
    }
    
    /*
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    } */
    
  };
}


var counter = 0;

var words_arr;
var words_arr_copy;
var words_arr_length;
var word_regex;

/*
 * Activates the edit mode and saves the text update. 
 * 
 * While no edit has been done, each call on this function 
 * selects the last word of the text one by one until reached the beginning.
 */
function selectButton() {
 // If we haven't modifed any word yet
 if(!edit_done) {
    select_button.innerHTML = "&larr; Modify";
    counter++;
    if(counter == 1) {
      transcript = final_span.innerHTML;
      words_arr = transcript.split(' ');
      words_arr_length = words_arr.length;
      //select the last word you said
      word = words_arr[words_arr_length - 1];

      final_span.innerHTML = replaceWord(transcript, words_arr_length, word, counter);

      //final_span.innerHTML = transcript.replace(word, "<span id='selected_word' class='highlight'>" + word + "</span>");
      console.log(transcript);

   } else if(counter <= words_arr_length && counter > 1) {
      word = words_arr[words_arr_length - counter];
      final_span.innerHTML = replaceWord(transcript, words_arr_length, word, counter);
      //final_span.innerHTML = transcript.replace(word, "<span id='selected_word' class='highlight'>" + word + "</span>");

   } else { //once we traversed the whole text, exit this state.
      final_span.innerHTML = transcript;
      counter = 0;
      select_button.innerHTML = "Modify";
   }
 } else {
   select_button.innerHTML = "Modify";
   words_arr[words_arr_length - counter] = new_word;
   //console.log(words_arr);
   //console.log(words_arr.join(' '));
   final_span.innerHTML = words_arr.join(' ');
   
   //reset everything after the edit has been done
   counter = 0;
   edit_done = false;
 }

}

/*
 * Replace the word in str at the given 'index' by the variable in 'word'
 */
function replaceWord(str, num_words, word, index) {
  var arr = str.split(' ');;
  arr[num_words - index] = "<span id='selected_word' class='highlight'>" + word + "</span>";

  return arr.join(' ');
}



function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

/*
 * This function is called when the mic icon is clicked.
 * It resets the main variables for the text entry and start the recording.
 */
function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';

  //reset selectButton()
  transcript = '';
  counter = 0;
  select_button.innerHTML = "Modify";
  edit_done = false;

  //recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = './lib/img/mic-slash.gif';
  //showInfo('info_allow');
  //showButtons('none');
  start_timestamp = event.timeStamp;
}
