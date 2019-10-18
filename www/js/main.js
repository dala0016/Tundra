let tinyshell;

const app = {
    URL: "http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=",
    imgUrl: "",
    // Default gender at start
    gender: "male",
    profiles: [],
    DATA: null,

    init: function(){
        // Create new instance of Tinyshell
        let target = document.getElementById('gender');
        let gender = new t$(target);
        // Add swipe event listeners to gender selection screen
        gender.addEventListener(t$.EventTypes.SWIPELEFT, app.genSwipe);
        gender.addEventListener(t$.EventTypes.SWIPERIGHT, app.genSwipe);
        // Remove pointer/tap event CSS from the menu bar at bottom
        document.querySelector(".bar").classList.add("nopointer");
    },

    // Add listeners for cards and bottom bar tabs
    addHandlers: function(){
        // Add listeners to card divs
        let cardsNode = document.querySelectorAll('.card');
        // Create instance of tinyshell for card element
        let mgr = new t$(cardsNode);
        mgr.addEventListener(t$.EventTypes.SWIPELEFT, app.reject);
        mgr.addEventListener(t$.EventTypes.SWIPERIGHT, app.accept);
        // Add listeners to bottom bar tabs for Home/main and Favourites
        let nmgr = new t$(document.querySelectorAll(".bar .tab"));
        nmgr.addEventListener(t$.EventTypes.TAP, app.nav);
        // Add pointer/tap event CSS back to menu bar at bottom
        document.querySelector(".bar").classList.remove("nopointer");
    },

    // Swipe at intro screen to choose gender
    genSwipe: function(ev){
        // If user swipes for female profiles, change app.gender to female from default male
        if(ev.type == 'swiperight'){
            app.gender = 'female';
        }
        // Add classes to intro page divs that cause them to move outside the viewport
        document.getElementById('prompt-male').classList.add('move-left');
        document.getElementById('prompt-female').classList.add('move-right');
        // Timeouts for smooth transition from into screen to presentation of first card
        setTimeout(() => {
            document.getElementById('gender').classList.remove('active');
        }, 500);
        setTimeout(() => {
            document.getElementById('main').classList.add('active');
        }, 500);
        setTimeout(() => {
            app.getData();
        }, 400);
        document.getElementById('home').classList.add('current');
    },

    // Check which tab was selected and make selected page active, and highlight appropriate tab to reflect that
    nav: function(ev){
        switch (ev.target.id) {
            // If user selects home/main page on the bar
            case 'home':
                document.getElementById('main').classList.add('active');
                document.getElementById('home').classList.add('current');
                document.getElementById('favourites').classList.remove('active');
                document.getElementById('favs').classList.remove('current');
                break;
            // If user selects favourites page on the bar
            case 'favs':
                document.getElementById('favourites').classList.add('active');
                document.getElementById('favs').classList.add('current');
                document.getElementById('main').classList.remove('active');
                document.getElementById('home').classList.remove('current');
                break;
    }},

    // fetch to retrieve profile data
    getData: function(){
        // Get stored base URL and add the selected gender to the string, then fetch based on complete URL
        fetch(app.URL + app.gender)
        // Take response and return it as promise that parses as JSON
        .then(response => response.json())
        // Take that JSON and place certain properties into variables for local management and later use
        .then(data => {
            console.log(app.DATA);
            console.log(data);
            // Place ALL json data retrieved into DATA namespace
            app.DATA = data;
            // Take encoded URL from DATA and decode it, then enter it into imgUrl namespace
            app.imgUrl = 'http:' + decodeURIComponent(app.DATA.imgBaseURL);
            // Take profile data currently in app.DATA from current fetch iteration and place it into local app.profiles array and
            // combine that data with whatever profiles may already be inside the array
            app.profiles = app.profiles.concat(app.DATA.profiles);
            // Build the cards based on the profiles in the local app.profiles array
            app.buildCards(app.profiles);
        });
    },

    // Build card for each profile in local app.profiles array
    buildCards: function(arr){
        let df = new DocumentFragment();
        arr.forEach(person => {
            // Create card div
            let card = document.createElement('div');
            card.classList.add('card');
            card.classList.add('fixed');
            // Behave as if there is no top menu/bar
            card.classList.add('nobar');
            // Add initial class so card is invisible
            card.classList.add('dot');
            // Set id of card to match the id of the profile represented by the card
            card.setAttribute('id', person.id);
            // Create img element and add image to card
            let img = document.createElement('img');
            // Create src attribute for img element based on the imgUrl locally stored + the remaining required information
            // stored in profile currently being created
            img.src = app.imgUrl + person.avatar;
            // Create alt-text for img based on the gender of the profile
            img.alt = `A ${person.gender} Avatar`;
            // Create h2 element and add name to card
            let name = document.createElement('h2');
            name.textContent = `${person.first} ${person.last}`;
            // Create text field for distance
            let dist = document.createElement('p');
            dist.textContent = `This person is ${person.distance} away!`;
            document.querySelector('#main').innerHTML = '';
            card.appendChild(name);
            card.appendChild(img);
            card.appendChild(dist);
            df.appendChild(card);
        });
        // Append card to main page/div
        document.querySelector('#main').appendChild(df);
        // Wait until swipe is complete to make next card appear
        setTimeout(() => {main.firstElementChild.classList.remove('dot')}, 100);
        // Add event listeners for swiping to newly created cards
        app.addHandlers();
    },
    // Function for rejection of profile
    reject: function(ev) {
        // Add the class of left to the target card, which causes it to go left off screen
        ev.target.classList.add("left");
        // Execute prompt() function to display overlay telling user they have rejected that profile
        app.prompt('reject');
        // Wait for card to be completely off screen
        setTimeout(() => {
            // Find the card we just swiped
            let element = document.getElementById("main").firstElementChild;
            // Clear the card we just swiped
            element.outerHTML = "";
            // Delete the entire element from the page
            delete element;
            // Take the next card and remove the dot class, causing it to appear as the next card to be accepted or rejected
            document.getElementById("main").firstElementChild.classList.remove('dot');
            // Shift the first member of the local app.profiles array OFF the array
            app.profiles.shift();
            // If there are 3 or less items left in the array, get more profiles and add them to the remaining profiles
            if (app.profiles.length < 3){
                app.getData();
        }
        }, 250);},
    // Function for accept of profile
    accept: function(ev) {
        // Add the class of right to the target card, which causes it to go righ off screen
        ev.target.classList.add("right");
        // Execute prompt() function to display overlay telling user they have accepted that profile
        app.prompt('accept');
        // Set the first item in the profiles array (currently active and accepted card/profile) to sessionStorage with a key derived from the
        // profile's id and turn JSON profile information into a string for storing in sessionStorage
        sessionStorage.setItem(app.profiles[0].id, JSON.stringify(app.profiles[0]));
        // Execute addFavs to create "favourites" array based on current sessionStorage members
        app.addFavs();
        // Wait for card to be completely off screen
        setTimeout(() => {
            // Find the card we just swiped
            let element = document.getElementById("main").firstElementChild;
            // Clear the card we just swiped
            element.outerHTML = "";
            // Delete the entire element from the page
            delete element;
            // Take the next card and remove the dot class, causing it to appear as the next card to be accepted or rejected
            document.getElementById("main").firstElementChild.classList.remove('dot');
            // Shift the first member of the local app.profiles array OFF the array
            app.profiles.shift();
            // If there are 3 or less items left in the array, get more profiles and add them to the remaining profiles
            if (app.profiles.length <= 3){
                app.getData();
        }
        }, 250);},
    // Activate overlay and display message dependent on how it was called
    prompt: function(choice){
        let overlay = document.querySelector('.overlay-bars');
        // Make overlay visible
        overlay.classList.add('active');
        // Switch message displayed based on how the prompt function was called
        switch (choice) {
            // Profile is accepted
            case 'accept':
                var message = document.querySelector('.t3');
                message.classList.remove('error');
                message.classList.add('success');
                message.innerHTML = 'Saving to Favourites';
                break;
            // Profile is rejected
            case 'reject':
                var message = document.querySelector('.t3');
                message.classList.remove('success');
                message.classList.add('error');
                message.innerHTML = "Rejected!";
                break;
            // Profile is deleted from the favourites page
            case 'delete':
                var message = document.querySelector('.t3');
                message.classList.remove('success');
                message.classList.add('error');
                message.innerHTML = "Removing from Favourites";
                break;
        }
        // Timeout for removing the overlay after message is displayed
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 500);
    },
    // Create favourites array and then loop through sessionStorage based on it's length, adding each sessionStorage member to the array
    addFavs: function(){
        let favourites = [];
        console.log(sessionStorage.length);
        for (let i = 0; i < sessionStorage.length; i++) {
            // Get key for member in sessionStorage at position of index i, place it in a variable
            let keyvar = sessionStorage.key(i);
            // Retrieve sessionStorage member data based on key in keyvar and turn the string back into JSON for placement in the "favourites" array
            favourites.push(JSON.parse(sessionStorage[keyvar]));
        }
        // Take current favourites array and call the list builder for the Favourites page
        app.listBuilder(favourites);
        // After list items have been built, add listeners for the delete button on all list members
        let tis = new t$(document.querySelectorAll('.action-right'));
        tis.addEventListener(t$.EventTypes.TAP, app.deleteFav);
    },
    // Build the list of favourites based on what is currently in session storage
    listBuilder: function(arr){
        let df = new DocumentFragment();
        arr.forEach(favourite =>{
            let favItem = document.createElement('li');
            favItem.classList.add('list-item');
            // Add id of profile as the id attribute of the list item (li)
            favItem.setAttribute('id', favourite.id);
            let img = document.createElement('img');
            img.src = app.imgUrl + favourite.avatar;
            img.alt = `A ${favourite.gender} Avatar`;
            img.classList.add('avatar');
            let name = document.createElement('p');
            name.textContent = `${favourite.first} ${favourite.last}`;
            let span = document.createElement('span');
            span.classList.add('action-right');
            span.classList.add('icon');
            span.classList.add('clear');
            favItem.appendChild(img);
            favItem.appendChild(name);
            favItem.appendChild(span);
            df.appendChild(favItem);
        });
        // Clear current elements in the list and generate new list based on previous and newly added favourite profiles
        document.querySelector('.favlist').innerHTML = '';
        document.querySelector('.favlist').appendChild(df);
    },

    // Delete profiles from favourites list
    deleteFav: function(ev) {
        // Call prompt function for overlay with message notifying user of deletion
        app.prompt('delete');
        // Target the parent element of the span (our delete button), in this case the entire list item containing the span
        var element = ev.target.parentElement;
        // Go into sessionStorage and remove the member with the key that matches the list item's id (made to match user profile id)
        sessionStorage.removeItem(element.getAttribute('id'));
        element.outerHTML = "";
        delete element;
    }
};

let loadEvent = ('deviceready' in document)?'deviceready':'DOMContentLoaded';
document.addEventListener(loadEvent, app.init);