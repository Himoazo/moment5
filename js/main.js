// Denna fil ska innehålla din lösning till uppgiften (moment 5).

"use strict";

/*  Delar till ej obligatorisk funktionalitet, som kan ge poäng för högre betyg
*   Radera rader för funktioner du vill visa på webbsidan. */
//document.getElementById("player").style.display = "none";      // Radera denna rad för att visa musikspelare
//document.getElementById("shownumrows").style.display = "none"; // Radera denna rad för att visa antal träffar

/* Här under börjar du skriva din JavaScript-kod */

// Starten av applikationen
window.onload = init;
//Anrop för funktioner vid sidoladdning
function init(){
    getChannels();
    loadStorage(); 
}
// Hämtar data från SR webbtjänst
function getChannels(){
    const url = "https://api.sr.se/api/v2/channels?format=json&pagination=false"; //Sveriges Radio API

    //Aanrop webtjänst
    fetch(url)
    .then(response=> response.json()) //konvertera inhämtad data till javascript
    .then(data=> {displayChannels(data.channels); liveRadio(data.channels);}) //Anrop av 2st funktioner nedan
    .catch(error=> console.log(error));
}
//Ladda in kanalerna till menyn 
function displayChannels(channels){
   const channelList = document.getElementById("mainnavlist"); // välj listan som visar kanalerna
   channelList.style.listStyleType = "none";  // Tar bort dots från list items

   // Loopa genom kanal arrayn och skriv ut namn till DOM
channels.forEach(channel => {
     //Skippar en kanal vars url inte fungerar
     if(channel.id === 4868){
        return;
    }
    //Skapa <li> för vaje kanal
    let channelItem = document.createElement("li");   

    // Hämtar kanal bild och skickar den till listan
    let channelIcon = document.createElement("img");
    channelIcon.setAttribute("src", channel.image);
    channelIcon.style.height = "15px";
    channelIcon.style.width = "15px";
    channelIcon.style.marginRight = "5px";
    channelItem.appendChild(channelIcon);

    //Skickar kanalernas namn till kanallistan
    let channelName = document.createTextNode(channel.name); 
    channelItem.appendChild(channelName);  //slå ihop text & li
    
    //Anrop för funktion som visar information om kanalen vid mouseover
    channelItem.addEventListener("mouseover", function(){
        showInfo(channel.tagline);
    });  

    //Anrop vid klick på kanalen för funktion som hämtar tablå. Skicka med kanal id som argument
    channelItem.addEventListener("click", function(){
        getSchedule(channel.id);
        localStorage.setItem("clickedChannel", channel.name); //Lagra senaste valda kanal
    });

    //event listener som vid click anropar en funktion som sätter headers färg till kanalens färg
    channelItem.addEventListener("click", function(){
        let color = "#" + channel.color;
        document.getElementById("mainheader").style.backgroundColor = color;
    });
    
    
    //slå ihop och skriv ut till DOM
    channelList.appendChild(channelItem);  
});
   
const channelCount = document.getElementById("numrows"); //Välj input fält
const channelItemEl = document.querySelectorAll("li");  //välj alla li

// Visa antal kanal i listan enligt input värdet
channelCount.addEventListener("change", function(){
  const numberOfChannels = channelCount.value;   //lagra input värde i vaiable
  channelItemEl.forEach((li, index) => {   //loopa genom li listan i ordning
    if (index < numberOfChannels) {        // om index är mindre än inmatat värde
      li.style.display = 'block';          // visa li
    } else {
      li.style.display = 'none';          // visa inte li vars index stiger över inmatat värde
    }
  });
});
}

// funktion som visar info om kanalen vid mouseover
function showInfo(tagLine){
    let channelInfo = tagLine;
    let channelInfoEl = document.getElementsByTagName("li");
    //Loopa genom 
    for(let i=0; i < channelInfoEl.length; i++){
        channelInfoEl[i].title = channelInfo;  // .title för att visa info om kanalen
    }
     
}  

// Funktion som hämtar tablåerna
function getSchedule(channelId){
    const url = "https://api.sr.se/api/v2/scheduledepisodes?channelid="+ channelId +"&format=json&pagination=false"

    //Anrop av webbtjänsten
     fetch(url)
    .then(response=> response.json())
    .then(data => displaySchedule(data.schedule))
    .catch(error=> console.log(error)); 
}

// funktion som läser in tablåerna och skriver ut dem till DOM
function displaySchedule(schedule){
    const scheduleDiv = document.getElementById("info");
    scheduleDiv.innerHTML = "";  //Raderar info från förra klicket
    
    //Loopa genom tablå-array:n
    schedule.forEach(program=> {
       
    
        // Tid av program sändning
        let startUtc = parseInt(program.starttimeutc.substr(6));
        let endUtc = parseInt(program.endtimeutc.substr(6));
        let currentTime = Date.now();
        let start = new Date(startUtc);
        let end = new Date(endUtc);
        let startHour = start.getHours();
        let startMinutes = start.getMinutes();
        let endHours = end.getHours();
        let endMinutes = end.getMinutes();
        // läg till 0 om timme/minut är mindre än 10
        if(startHour < 10){startHour = "0" + startHour}
        if(startMinutes < 10){startMinutes = "0" + startMinutes}
        if(endHours < 10){endHours = "0" + endHours}
        if(endMinutes < 10){endMinutes = "0" + endMinutes}
        if(endUtc > currentTime){  // Tids kontroll bara kommande program fram till midnatt som visas

        //Utskrift av program namn till DOM
        let programSection = document.createElement("section");
        let programTitle = document.createElement("h1");
        let programTitleText = document.createTextNode(program.program.name);
        programTitle.appendChild(programTitleText);
        programSection.appendChild(programTitle);
        //Utskrift av tiden
        let programTime = document.createElement("h6");
        let timeText = document.createTextNode(startHour + ":" + startMinutes + " - " + endHours + ":" + endMinutes);
        programTime.appendChild(timeText);
        
        // kontroll och inläsning av subtitle om den finns
        if('subtitle' in program === true){
            let programSubTitle = document.createElement("h4");
            let subtitleText = document.createTextNode(program.subtitle);
            programSubTitle.appendChild(subtitleText);
            programSection.appendChild(programSubTitle);
       } 

        //Slå ihop element
        scheduleDiv.appendChild(programSection);
        programSection.appendChild(programTime);
        }
        
    });
    
}
    // function som spelar livesändning från den valda knalen från listan vid klick på spela knappen
    function liveRadio(live){
        const radioList = document.getElementById("playchannel");  //välj <select> element
        
        // loopa genom kanal array som kommer från webtjänsten
        live.forEach(radio => {
            if(radio.id === 4868){   // Skippar en kanal vars URL inte fungerar
                return;
            }

            const option = document.createElement("option");  //skapa <option>
            option.setAttribute('value', radio.liveaudio.url); // ge den value=
            option.textContent = radio.name; //ta in kanal namn i option
            radioList.appendChild(option);  //sl ihop
         }); 

         const playButton = document.getElementById("playbutton");  //välj knappen
         playButton.addEventListener('click', function() {   //händelsehanterar vid knapptryck
            const audioUrl = new Audio(radioList.value);  // skapar HTMLAudioElement
            audioUrl.controls = true;                     // visar spelaren 
            audioUrl.play();                               //spela direkt vid click
            const player = document.getElementById('radioplayer');  //väljer radiospelar div
            player.innerHTML = "";                                  //raderar det som fanns i plyaer
            player.appendChild(audioUrl);                            // stoppa in HTMLAudioElement i player div      
          });
 } 

 // Funktion som talar om vilken tablå har användaren kikat på sist
 function loadStorage(){
    //Hämtar sparat data i localStorage och lagrar det i variable
    let storage = localStorage.getItem("clickedChannel");
    if(storage !== null){   // Kontroll om det finns data i storage
        const scheduleDiv = document.getElementById("info");
        const storageParagraph = document.createElement("p");
        let storageText = document.createTextNode("Sist kollade du på tablån för: " +storage);
        storageParagraph.style.fontSize = "30px";
        storageParagraph.style.marginTop = "20%";
        storageParagraph.appendChild(storageText);
        scheduleDiv.appendChild(storageParagraph);
    }
    
 }
