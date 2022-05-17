//Global variables

const burgerIcon = $("#burger");
const navbarMenu = $("#nav-links");

const apiKey = "a447661e09msh17b913e41ecacfdp129f05jsn6e2975fac8c4";

const spotifyBaseUrl = "https://spotify23.p.rapidapi.com/search/";

const edamamBaseUrl = "https://edamam-recipe-search.p.rapidapi.com/search";

const surpriseMe = [
  "surprise",
  "cookie",
  "chocolate",
  "dessert",
  "spicy",
  "cake",
  "tapas",
  "sweet",
  "salty",
  "chilli",
  "bites",
  "burger",
  "buns",
  "bread",
  "grill",
  "cupcake",
];

let currentEventName = "";

//UTILITY FUNCTIONS

//extract info from local storage (get)
const getFromLocalStorage = (key, defaultValue) => {
  const parsedData = JSON.parse(localStorage.getItem(key));
  return parsedData ? parsedData : defaultValue;
};

//write info into local storage (set)
const writeToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

//empty local storage (clear)
const clearLS = () => {
  localStorage.clear();
};

//removes the designated container - target by ID
const removeContainer = (containerId) => {
  if (containerId) {
    //remove the container itself and all its content
    $(`#${containerId}`).remove();
  }
};

//empty the designated container - target by ID
const emptyContainer = (containerId) => {
  if (containerId) {
    //remove the container itself and all its content
    $(`#${containerId}`).empty();
    $(`#${containerId}`).off();
  }
};

//END UTILITY FUNCTIONS

//Functions

const renderError = (message, containerId) => {
  // create component
  const errorComponent = `<div class="notification is-danger is-light">
      <i class="fa-solid fa-triangle-exclamation"></i> ${message}
    </div>`;

  // append component to musicContainer
  containerId.append(errorComponent);
};

//empty aside list, get update from local storage and renders list again
const updateAsideList = (theseChosenItems) => {
  $("#selected-items-list").empty();

  const createSelectedItem = (each) => {
    const selectedItemName = each.targetName;
    $("#selected-items-list").append(`<li>${selectedItemName}</li>`);
  };
  theseChosenItems.forEach(createSelectedItem);
};

//select a word at random from the surpriseMe array
const getSurpriseWord = () => {
  const surpriseWordIndex = Math.floor(Math.random() * surpriseMe.length);
  return surpriseMe[surpriseWordIndex];
};
//get item selected by user from select list
const getUserChoice = () => {
  const userChoice = $("#food-select").find(":selected").attr("value");

  return userChoice === "surprise-me"
    ? getSurpriseWord()
    : $("#food-select").find(":selected").attr("value");
};

//Handling food submit in food-container section - Edamam api call
const handleFoodSubmit = async (event) => {
  event.stopPropagation();
  event.preventDefault();

  try {
    // get form values for api
    const searchQuery = getUserChoice();

    // validate form
    if (searchQuery) {
      // construct the URL
      const baseUrl = edamamBaseUrl;

      const url = constructUrl(baseUrl, { q: searchQuery });

      // construct fetch options
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": "edamam-recipe-search.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        },
      };

      // fetch data from API
      const data = await fetchData(url, options);

      renderFoodCards(data?.hits || []);
    } else {
      // target input and set class is-danger
      searchInput.addClass("is-danger");
    }
  } catch (error) {
    renderError(
      "Sorry something went wrong and we are working on fixing it.",
      foodContainer
    );
  }
};

const handleMusicAsideClick = (e) => {
  e.stopPropagation();
  const target = $(e.target);
  if (target.is("button")) {
    renderEventCard();
  }
};

//render the music section in the main container
const renderMusicSection = () => {
  emptyContainer("main");
  const tempName = currentEventName;
  $("#main")
    .append(`<section class="section is-flex-direction-row" id="music-section">
    <div class="container has-text-centered" id="music-container">
      <form class="form" id="music-selection">
        <p class="music-text-div">Please select your desired music</p>
        <div
          class="form-field is-flex-direction-row is-align-content-center my-5"
        >
          <input type="text" class="music-input" id="music-type" />
  
          <button
            class="button is-rounded is-small"
            type="submit"
            id="music-submit-btn"
          >
            Submit
          </button>
        </div>
      </form>
      <div class="card-container" id="music-card-container">
      </div>
    </div>
    <div class="aside music-aside has-text-centered m-3" id="music-aside">
      <div class="aside-list my-5">
        <h4 class="aside-text m-5">Your selected playlists</h4>
        <ul class="selected-items-list" id="selected-items-list">
        </ul>
      </div>
      <div class="aside-event my-5">
        <h4 class="aside-text m-5">For the event</h4>
        <p class="event-select" name=${tempName} id="event-select">${tempName}</p>
      </div>
      <div class="aside-btn my-5">
        <button
          class="button is-rounded is-small my-5"
          type="button"
          id="music-save-btn"
          data-theme="music"
        >
          Save & Continue
        </button>
      </div>
    </div>
    </section>`);

  $("#music-selection").submit(handleMusicSubmit);

  $("#music-aside").click(handleMusicAsideClick);
};

const handleFoodAsideClick = (e) => {
  e.stopPropagation();
  const target = $(e.target);
  if (target.is("button")) {
    renderMusicSection();
  }
};

//render the food section in the main container
const renderFoodSection = (name) => {
  emptyContainer("main");
  const tempName = name;

  $("#main")
    .append(`<section class="section is-flex-direction-row" id="food-section">
    <div class="container has-text-centered" id="food-container">
      <form class="form" id="food-selection">
        <p class="food-text-div">Please select your desired food</p>
  
        <div
          class="form-field is-flex-direction-row is-align-content-center my-5"
        >
          <select class="food-select" name="food-type" id="food-select">
            <option value="japanese">Japanese</option>
            <option value="ethiopian">Ethiopian</option>
            <option value="turkish">Turkish</option>
            <option value="mexican">Mexican</option>
            <option value="chinese">Chinese</option>
            <option value="indian">Indian</option>
            <option value="thai">Thai</option>
            <option value="italian">Italian</option>
            <option value="brazilian">Brazilian</option>
            <option value="korean">Korean</option>
            <option value="french">Indian</option>
            <option value="surprise-me">Surprise me!</option>
          </select>
  
          <button
            class="form-button button is-rounded is-small"
            type="submit"
            id="food-submit-btn"
          >
            Submit
          </button>
        </div>
      </form>
      <div class="card-container" id="food-card-container"> 
      </div>
    </div>
    <div class="aside food-aside has-text-centered m-3" id="food-aside">
      <div class="aside-list my-5">
        <h4 class="aside-text m-5">Your selected food</h4>
        <ul class="selected-items-list" id="selected-items-list">
        </ul>
      </div>
      <div class="aside-event my-5">
        <h4 class="aside-text m-5">For the event</h4>
        <p class="event-select" name=${tempName} id="event-select">${tempName}</p>
      </div>
      <div class="aside-btn my-5">
        <button
          class="button is-rounded is-small my-5"
          type="button"
          id="food-save-btn"
          data-theme="food"
        >
          Save & Continue
        </button>
      </div>
    </div>
    </section>`);

  $("#food-selection").submit(handleFoodSubmit);
  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventName === tempName
  );
  const chosenFoodItems = myEvents[currentEventIndex][food];
  console.log(chosenFoodItems);
  updateAsideList(chosenFoodItems);
  $("#food-aside").click(handleFoodAsideClick);
};

//render small cards on event card to display selected playlists
const renderSmallMusicCard = (selectedMusic) => {
  const createSmallCard = (each) => {
    $("#small-music-card-container")
      .append(`<div class="card small-card" id="small-card-1">
    <div class="card-image">
      <figure class="image is-4by3">
        <img
          src=${each.targetPic}
          alt="recipe cover image"
        />
      </figure>
    </div>
    <div class="small-card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-6">${each.targetName}</p>
        </div>
      </div>
    </div>
    </div>`);
  };

  selectedMusic.forEach(createSmallCard);
};

//render small cards on event card to display selected recipes
const renderSmallFoodCard = (selectedFood) => {
  const createSmallCard = (each) => {
    $("#small-food-card-container")
      .append(`<div class="card small-card" id="small-card-1">
    <div class="card-image">
      <figure class="image is-4by3">
        <img
          src=${each.targetPic}
          alt="recipe cover image"
        />
      </figure>
    </div>
    <div class="small-card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-6">${each.targetName}</p>
        </div>
      </div>
    </div>
    </div>`);
  };

  selectedFood.forEach(createSmallCard);
};

const handleEditClick = (e) => {
  e.stopPropagation();
  const eventName = $(event.target).attr("data-value");
  //get event from local storage
  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventName === currentEventName
  );
  const currentEvent = myEvents[currentEventIndex];

  //render food section
  renderFoodSection(eventName);
  //populate the aside list with the food selection already in storage in the event
};

const handlePrintCard = () => {
  window.print();
};

const renderEventCard = (e) => {
  emptyContainer("main");

  const currentEventName = $(e.target).attr("data-value");
  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventName === currentEventName
  );
  const currentEvent = myEvents[currentEventIndex];
  const eventName = currentEvent.eventName;
  const eventDate = currentEvent.eventDate;
  const eventLocation = currentEvent.eventLocation;
  const eventDescription = currentEvent.eventDescription;
  const eventOrganiser = currentEvent.eventOrganiser;
  const organiserEmail = currentEvent.organiserEmail;

  $("#main").append(`<section class="event-card-section has-text-centered">
    <div class="card-design section-to-print event-card-container m-5">
      <h2>You are officially invited to my event: ${eventName}</h2>
      <div class="event-details">
        <p class="event-card-text key-info">
          This event is scheduled on the ${eventDate} and will take place at this location: ${eventLocation}
        </p>
        <p class="event-card-text key-info">
          Here is what you need to know about this event: ${eventDescription}
        </p>
        <p class="event-card-text key-info">Additional non dynamic text</p>
      </div>
  
      <div class="event-selection-container">
        <div class="event-food-container">
          <p class="event-card-text key-info">
            This is the food on offer at the event
          </p>
          <div class="small-card-container" id="small-food-card-container">
          </div>
        </div>
        <div class="event-music-container">
          <p class="event-card-text key-info">
            We will be enjoying these playlists
          </p>
          <div class="small-card-container" id="small-music-card-container">
          </div>
        </div>
      </div>
      <div class="end-text" id="end-text">
        <p>
          This event is organised and managed by ${eventOrganiser}. To RSVP and if you have any questions, please use this email address: ${organiserEmail}
        </p>
      </div>
    </div>
    <div class="btn-div m-5">
      <button class="button print-btn is-rounded is-big m-2" id="print-btn" type="button" data-action="print">
        Print this event card
      </button>
      <button
        class="button selection-btn is-rounded is-big m-2"
        type="button"
        id="selection-btn"
        data-value="${eventName}"
        data-action="edit"
      >
        Edit Food/Music Selection
      </button>
    </div>
    </section>`);

  const selectedFood = myEvents[currentEventIndex].food;
  const selectedMusic = myEvents[currentEventIndex].music;

  renderSmallFoodCard(selectedFood);
  renderSmallMusicCard(selectedMusic);

  $("#selection-btn").click(handleEditClick);
  $("#print-btn").click(handlePrintCard);
};

const handleEventCardClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  const target = $(event.target);
  const targetId = $(event.target).attr("id");
  console.log(target, targetId);

  if (targetId === "event-card-btn") {
    renderEventCard(e);
  }
};

//render food cards
const renderSavedEvents = (items) => {
  if (items.length) {
    const createCard = (item, i) => {
      const eventName = item.eventName;
      const eventDate = item.eventDate;
      const eventLocation = item.eventLocation;

      const eventFood = item.food;
      const eventFoodList = [];
      if (!eventFood) {
        eventFoodList.push("No food selected yet");
      } else {
        for (let i of eventFood) {
          eventFoodList.push(i.targetName);
        }
      }

      const eventMusic = item.music;
      const eventMusicList = [];
      if (!eventMusic) {
        eventMusicList.push("No music selected yet");
      } else {
        for (let i of eventMusic) {
          eventMusicList.push(i.targetName);
        }
      }

      //rendering with template string - TEMPORARY Template string
      const eventCard = `<div class="event-card card" id="${eventName}">
      <h2
        class="title is-4 card-header-title has-text-centered"
        id="event-card-name"
      >
        ${eventName}
      </h2>
      <div class="event-details card my-5">
        <ul class="card-content m-0">
          <li class="event-list-item" id="event-date-1">${eventDate}</li>
          <li class="event-list-item" id="event-location-1">
            ${eventLocation}
          </li>
          <li class="event-list-item" id="event-food">Selected food: ${eventFoodList}</li>
          <li class="event-list-item" id="event-music">Selected playlists: ${eventMusicList}</li>
        </ul>
        <button class="button is-rounded is-small my-2 event-card-btn" id="event-card-btn"
        type="button"
          data-value="${eventName}">
          See full event card</i>
        </button>
      </div>
    </div>`;

      return eventCard;
    };

    const allCards = items.map(createCard).join("");

    const savedEventsContainer = $("#saved-events-container");
    emptyContainer("saved-events-container");
    savedEventsContainer.append(allCards);
    $("#saved-events-container").click(handleEventCardClick);
  } else {
    // render error
    renderError("No results found.", savedEventsContainer);
  }
};

const getSavedEvents = () => {
  return getFromLocalStorage("myEvents", []);
};

// On load
const onReady = () => {
  //event listener for mobile burger bar menu for html pages -Youtube NetNinja Bulma
  burgerIcon.click(() => {
    navbarMenu.toggleClass("is-active");
  });

  //pull my events from local storage using key name "myEvents"
  const savedEvents = getSavedEvents();

  //call function to render the saved events in cards
  renderSavedEvents(savedEvents);
};

$(document).ready(onReady);