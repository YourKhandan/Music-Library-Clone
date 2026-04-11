// console.log('lets wirte some js');
function secondsToMinutesSeconds(seconds){
    if(isNaN(seconds)||(seconds<0)){
        return "invalid"
    }
    const minutes=Math.floor(seconds/60);
    const remainingSeconds=Math.floor(seconds%60);
    const formattedMinutes=String(minutes).padStart(2,'0')
    const formattedSeconds=String(remainingSeconds).padStart(2,'0')
    return `${formattedMinutes}:${formattedSeconds}`
}
let songs;
let currentSong=new Audio();
let currfolder;
//CURRENTSONG MAKES THE CURRENT SONG BE PLAYED
//GET SONGS FETCHES ALL THE SONGS
async function getSongs(folder) {
    currfolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    // console.log(a);
    
    let response = await a.text();
    
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        let href = element.getAttribute("href");

        // SKIP the "../" and only take .mp3 files
        if (href.endsWith(".mp3")) {
            // Clean the Windows backslashes if they appear
            let cleanHref = href.replaceAll("\\", "/");
            songs.push(cleanHref.split(`%5C${folder}%5C`)[1]);// here we load the songs
        }
    }
    

   // console.log("Found Songs:", songs);
    
    if (songs.length == 0) {
        console.log("No .mp3 files found in the folder!");
    }
    return songs
}
// async function main(){
// let songs=await getSongs()
// console.log(songs);
// let songul=document.querySelector(".songlist").getElementsByTagName("ul")[0]
// for (const song of songs){
//     songul.innerHTML=songul.innerHTML+`<li> ${song} </li>`
//     // Inside your getSongs loop...


// }
// document.addEventListener("click", () => {//as soon as it clicks on the document 
//     //then it plays
//         if (songs.length > 0) {
//             var audio = new Audio(songs[0]);
//              audio.addEventListener("loadedmetadata", () => {
//                 let duration = audio.duration;
//                 console.log("Total Duration:", duration); // No more NaN!
//             });
//             audio.play().catch(e => console.log("Playback blocked:", e));
//             console.log("Playing:", songs[0]);
//         }
//     }, { once: true }); // {once: true} makes sure it only triggers on the first click
// }
const playMusic = (track,pause=false) => {
    // 1. Update the source of our global player
    // Ensure 'track' has .mp3 if it was missing
    let finalTrack = track.endsWith(".mp3") ? track : track + ".mp3";
    //TRACK HAS THE MP3 SONG NAME
    currentSong.src = `songs/${currfolder}/` + finalTrack;
// if(!pause){
//     currentSong.play()
//     play.src="pause.svg"
// }
    // 2. Play the song
    currentSong.play().catch(e => {
        console.log("Playback failed. Check if file exists:", e);
        // console.log(currentSong.src);
        
    });
    document.querySelector("#play").src="pause.svg"//as soon as track plays do this
    // 3. Update the UI (Optional: Show name in the playbar)
    document.querySelector(".songtime").innerHTML="00:00/00:00"
    //document.querySelector(".songinfo").innerHTML="00:00"
    document.querySelector(".songinfo").innerHTML = decodeURI(finalTrack);
}

async function displayAlbums(){
    let a=await fetch(`http://127.0.0.1:3000/songs`)
    let response =await a.text()
    console.log(response);
    
    let div=document.createElement("div")
    div.innerHTML=response
    //console.log(div);
    let anchor=div.getElementsByTagName("a")
   // console.log(anchor);
    let folders=[]
Array.from(anchor).forEach(e => {
    // 1. Clean the URL: Replace encoded backslashes (%5C) with forward slashes (/)
    let cleanHref = e.href.replaceAll("%5C", "/");
    
    console.log("Checking cleaned link:", cleanHref);

    // 2. Updated condition to match the cleaned path
    if (cleanHref.includes("/songs/") && !cleanHref.endsWith(".mp3") && !e.innerHTML.includes("..")) {
        
        // 3. Split by "/" and get the last non-empty part
        let parts = cleanHref.split("/").filter(p => p !== "");
        let folder = parts[parts.length - 1];

        if (folder !== "songs") {
            console.log("FOUND ALBUM:", folder);
            folders.push(folder)
            // Now you can call your function to create cards here
        }
    } else {
        console.log("Ignored:", cleanHref);
    }
});
return folders

}
const makeCards = (folders) => {
    let cardContainer = document.querySelector(".cardContainer");
    
    // Clear the container so we don't have duplicates
    cardContainer.innerHTML = "";

    // Loop through each folder name in the array
    folders.forEach(folder => {
        // Build the card
        cardContainer.innerHTML += `
            <div class="card" data-folder="${folder}">
                <div class="play">
                    <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="56" height="" color="white" fill="white" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                        <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z""")/>>
                    </svg>
                </div>
                <img src="https://picsum.photos{folder}/200/200" alt="">
                <h2>${folder.replaceAll("%20", " ")}</h2>
            </div>`;
    });

    // Re-attach the click listeners so the new cards actually work
    attachAlbumClickListeners();
}

async function main() {
    
    // let songs = await getSongs(`ncs`);
    let myFolders = await displayAlbums();
console.log("My folders array:", myFolders); // This will now show the data
 makeCards(myFolders);
    // Select your song list container
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    
    // Clear the UL first so you don't get duplicates
    // songUL.innerHTML = "";

    for (const song of songs) {
        // CLEAN THE NAME: Remove path, .mp3, and %20 spaces
        let songName = song.split("/").pop()
                           .replaceAll(".mp3", "")
                           .replaceAll("%20", " ");

        // ADD THE NEW TEMPLATE (Matches your image)
        songUL.innerHTML += `
    <li data-path="${song}"> 
        <img class="invert" src="music.svg" alt="">
        <div class="song-info">
            <div>${songName}</div>
            <div>Unknown Artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
    </li>`;

    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
       e.addEventListener("click",element=>{
           playMusic(e.querySelector(".song-info div")?.innerHTML.trim(),true)//div shows the songname.mp3
           
        })

        //console.log(e.getElementsByClassName(".info"));
        
    })
}
main()
const attachAlbumClickListeners = () => {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            console.log("Switching to album:", folder);
            
            // Fetch and update the song list for this folder
            songs = await getSongs(folder); 
            updateSonglist(songs);
            
            // Automatically play the first song of the new album if you want:
            // playMusic(songs[0]); 
        });
    });
}

//attach event listener to play, next and previous
const playBtn = document.querySelector("#play");
playBtn.addEventListener("click", () => {
    if(currentSong.src===""){
        playMusic(songs[0])
        document.querySelector("#play img").src="pause.svg"
    }
    else{

        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "pause.svg"; // Switch icon to pause
            playBtn.alt="pause"
        } else {
            currentSong.pause();
            playBtn.src = "play.svg"; // Switch icon back to play
            playBtn.alt="play"
        }
    } 
});
currentSong.addEventListener("timeupdate",()=>{
    if (!isNaN(currentSong.duration)) {
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
}
    //console.log(currentSong.currentTime,currentSong.duration);
    document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%"})
document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent=((e.offsetX/e.target.getBoundingClientRect().width)*100)
     if (percent >= 0 && percent <= 100) {
    document.querySelector(".circle").style.left=percent+"%";
    currentSong.currentTime=((currentSong.duration)*percent)/100    
}
})
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});
currentSong.addEventListener("ended", () => {
    // 1. Force the song to the beginning
    currentSong.currentTime = 0;
    
    // 2. Target the image inside the button specifically
    // Use the exact class/ID path you have in your HTML
    let playIcon = document.querySelector(".Songbtns #play img");

    if (playIcon) {
        // Change it to the Play icon (the triangle)
        playIcon.src = "play.svg"; 
        // console.log("Song ended: Icon changed to Play");
    } else {
        // console.log("Error: Could not find the play button image!");
    }

    // 3. Reset the seekbar circle
    document.querySelector(".circle").style.left = "0%";
});
//make previous and next add eventlistener
// Previous Button
document.querySelector("#previous").addEventListener("click", () => {
    let currentFilename = currentSong.src.split("/").slice(-1)[0];
    let index = songs.indexOf(currentFilename);

    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    } else {
        // Optional: Loop to the last song if at the beginning
        playMusic(songs[songs.length - 1]);
    }
});

// Next Button
document.querySelector("#next").addEventListener("click", () => {
    let currentFilename = currentSong.src.split("/").slice(-1)[0];
    let index = songs.indexOf(currentFilename);

    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    } else {
        // Optional: Loop to the first song if at the end
        playMusic(songs[0]);
    }
});

document.querySelector(".volume input").addEventListener("input", (e) => {
    let value = e.target.value;
    
    // 1. Set the volume of the song
    currentSong.volume = parseInt(value) / 100;

    // 2. The Magic "Fill" Line: 
    // This paints from 0 to 'value' in Yellow, and the rest in Grey (#555)
    e.target.style.background = `linear-gradient(to right, yellow ${value}%, #555 ${value}%)`;

    // 3. Handle your Icon Change
    let volIcon = document.querySelector("#Volume");
    if (value == 0) {
        volIcon.src = "volume-mute.svg";
    } else {
        volIcon.src = "Volume-High.svg";
    }
});
const attachPlayListeners = () => {
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log("Playing song:", e.dataset.song);
            playMusic(e.dataset.song); // Assuming you have a playMusic function
        });
    });
}

const updateSonglist = (songs) => {
    // 1. Use "." because it is a CLASS, not an ID
    let songUL = document.querySelector(".songlist"); 
    
    if (!songUL) {
        console.error("Could not find .songlist element in HTML");
        return;
    }

    // 2. Clear the list
    songUL.innerHTML = ""; 

    // 3. Handle the "empty array" issue (since your log showed songs: [])
    if (!songs || songs.length === 0) {
        songUL.innerHTML = `<div class="no-songs">No .mp3 files found in this folder!</div>`;
        return;
    }

    // 4. Loop through songs if they exist
    songs.forEach(song => {
        let songName = song.replaceAll(".mp3", "").replaceAll("%20", " ");
        
        songUL.innerHTML += `
            <li data-song="${song}">
                <div class="info">
                    <div>${songName}</div>
                    <div>Artist Name</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    });

    // 5. Attach listeners (make sure this function exists!)
    if (typeof attachPlayListeners === "function") {
        attachPlayListeners();
    }
}


// 1. Correct the class name (no dot)
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (event) => {
        // 2. Use currentTarget to always get the card's dataset
        const folder = event.currentTarget.dataset.folder;
        
        // console.log("Fetching songs from folder:", folder);
        
        // 3. Call your getSongs function
        songs = await getSongs(`songs/${folder}`);
        
        // 4. Important: Call your UI update function here!
        updateSonglist() 
    });
});
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
        // Use currentTarget to ensure you get the card, even if you click an image inside it
        let folder = item.currentTarget.dataset.folder; 
        // console.log(item.currentTarget);
        // console.log(item.currentTarget.dataset.folder);
        
        // 1. Fetch the songs
        songs = await getSongs(`${folder}`);
        console.log(songs);
        
        // 2. YOU MUST CALL THE FUNCTION HERE to update the UI
        updateSonglist(songs); 
    });
});
