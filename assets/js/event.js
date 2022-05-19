//Global variables
const foodContainer = $("#food-card-container");

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

//Constructing the URL for an API call
const constructUrl = (baseUrl, params) => {
  const queryParams = new URLSearchParams(params).toString();

  return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
};

//Fetching the data from an API
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

//stores selected item into the event object in local storage
const handleItemSelection = (event) => {
  //need to look into amending the array (maybe pushing first one out, getting new one in at end of array)
  event.stopPropagation();
  const currentEventName = $("#event-select").text();

  const targetName = $(event.target).attr("data-value");
  const targetType = $(event.target).attr("data-type");
  const targetPic = $(event.target).attr("data-pic");

  const chosenItem = {
    targetName,
    targetPic,
  };

  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventName === currentEventName
  );
  const currentEvent = myEvents[currentEventIndex];
  let currentEventSelection = currentEvent[targetType];

  if (currentEventSelection) {
    const eventExists = currentEventSelection.some(
      (item) => item.targetName === chosenItem.targetName
    );

    if (eventExists) {
      //find a way to flag it on screen to the user
      console.log("Item is already selected");
      alert("This item has already been selected");
    } else {
      if (currentEventSelection.length < 3) {
        currentEventSelection.push(chosenItem);
        myEvents[currentEventIndex][targetType] = currentEventSelection;
        writeToLocalStorage("myEvents", myEvents);
      } else {
        //remove from array and add new item to remain at 3 items max
        const addMoreItems = confirm(
          "Would you like to replace the first item selected with this item?"
        );

        if (addMoreItems) {
          currentEventSelection.shift();

          currentEventSelection.push(chosenItem);

          myEvents[currentEventIndex][targetType] = currentEventSelection;
          writeToLocalStorage("myEvents", myEvents);
        }
      }
    }
  } else {
    //create key in object and allocate current selection value
    currentEventSelection = [];
    currentEventSelection.push(chosenItem);
    myEvents[currentEventIndex][targetType] = currentEventSelection;
    writeToLocalStorage("myEvents", myEvents);
  }

  //maybe do not need assign to event at all anymore?? check with debugger

  //re-render the selection list in the aside div
  updateAsideList(currentEventSelection);
};

//checks that the click happens on an add button
const handleItemClick = (event) => {
  event.stopPropagation();
  const target = $(event.target);
  const targetAdd = $(event.target).attr("data-action");
  console.log(targetAdd);
  if (target.is("button") && targetAdd === "add") {
    handleItemSelection(event);
  }
};

//render music cards
const renderMusicCards = (items) => {
  if (items.length) {
    const createCard = (item) => {
      const playlistTitle = item.data.name;
      const ownerName = item.data.owner.name;
      const playlistCover = item.data.images.items[0].sources[0].url;
      const linkUrl = item.data.uri;
      //rendering with template string - TEMPORARY Template string
      const playlistCard = `<div class="card api-card" id="music-card-${item.index}">
        <div class="card-image">
          <figure class="image is-4by3">
            <img
              src=${playlistCover}
              alt="album cover image"
            />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${playlistTitle}</p>
              <p class="subtitle is-6">${ownerName}</p>
            </div>
          </div>
        </div>
        <footer class="card-footer">
          <button
            class="button is-ghost card-footer-item"
            type="button"
            data-value="${playlistTitle}"
            data-pic="${playlistCover}" data-type="music" data-action="add"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
          <a
            href=${linkUrl}
            class="card-footer-item" target="_blank"
            ><i class="fa-brands fa-spotify"></i
          ></a>
        </footer>
      </div>`;

      return playlistCard;
    };

    const allCards = items.map(createCard).join("");

    const musicContainer = $("#music-card-container");
    emptyContainer("music-card-container");
    musicContainer.append(allCards);
    musicContainer.click(handleItemClick);
  } else {
    // render error
    renderError("No results found.", musicContainer);
  }
};

//render food cards
const renderFoodCards = (items) => {
  if (items.length) {
    const createCard = (item, i) => {
      const recipeTitle = item.recipe.label;
      const source = item.recipe.source;
      const recipeImage = item.recipe.image;
      const linkUrl = item.recipe.url;
      //rendering with template string - TEMPORARY Template string
      const foodCard = `<div class="card api-card" id="food-card-${i}">
        <div class="card-image">
          <figure class="image is-4by3">
            <img
              src=${recipeImage}
              alt="recipe cover image"
            />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${recipeTitle}</p>
              <p class="subtitle is-6">${source}</p>
            </div>
          </div>
        </div>
        <footer class="card-footer">
          <button class="button is-ghost card-footer-item"
          type="button"
            data-value="${recipeTitle}"
            data-pic="${recipeImage}" data-type="food" data-action="add">
            <i class="fa-solid fa-plus"></i>
          </button>
          <a
            href=${linkUrl}
            class="card-footer-item" target="_blank"
            ><i class="fa-solid fa-earth-americas"></i
          ></a>
        </footer>
      </div>`;

      return foodCard;
    };

    const allCards = items.map(createCard).join("");

    const foodContainer = $("#food-card-container");
    emptyContainer("food-card-container");
    foodContainer.append(allCards);
    foodContainer.click(handleItemClick);
  } else {
    // render error
    renderError("No results found.", foodContainer);
  }
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

//Handling form submit in music-container section - Spotify api call
const handleMusicSubmit = async (event) => {
  event.stopPropagation();
  event.preventDefault();

  try {
    // get form values
    const searchQuery = $("#music-type").val();
    const searchType = "playlists";

    // validate form
    if (searchQuery) {
      // construct the URL
      const baseUrl = spotifyBaseUrl;

      const url = constructUrl(baseUrl, { q: searchQuery, type: searchType });

      // construct fetch options
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        },
      };

      // fetch data from API
      const data = await fetchData(url, options);

      renderMusicCards(data?.playlists?.items || []);
    } else {
      // target input and set class is-danger
      searchInput.addClass("is-danger");
    }
  } catch (error) {
    renderError(
      "Sorry something went wrong and we are working on fixing it.",
      musicContainer
    );
  }
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
    window.location.reload(true);
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

  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventName === tempName
  );
  const chosenMusicItems = myEvents[currentEventIndex].music;

  updateAsideList(chosenMusicItems);
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
const renderFoodSection = () => {
  emptyContainer("main");
  const tempName = currentEventName;

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
  const chosenFoodItems = myEvents[currentEventIndex].food;

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
  currentEventName = eventName;

  //render food section
  renderFoodSection();
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

  $("#main")
    .append(`<section class="print-card-container event-card-section has-text-centered ">
    <div class="card-design print-card event-card-container m-5">
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
      <button class="button print-btn is-rounded is-big is-primary is-responsive m-2" id="print-btn" type="button" data-action="print">
        Print this event card
      </button>
      <button
        class="button selection-btn is-rounded is-big is-primary is-responsive m-2"
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

  if (targetId === "event-card-btn") {
    renderEventCard(e);
  }
};

//render Saved events
const renderSavedEvents = (items) => {
  if (items.length) {
    const createCard = (item, i) => {
      const eventName = item.eventName;
      const capitalisedEventName = item.eventName.replace(
        /\b[a-z]/g,
        function (letter) {
          return letter.toUpperCase();
        }
      );
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
      const eventCard = `<div class="event-card card pb-5" id="${eventName}">
      <h2
        class="title is-4 card-header-title has-text-centered"
        id="event-card-name"
      >
        ${capitalisedEventName}
      </h2>
      <div class="event-details card my-5">
        <ul class="card-content m-0">
          <li class="event-list-item" id="event-date-1">Date : ${eventDate}</li>
          <li class="event-list-item" id="event-location-1">Location : 
            ${eventLocation}
          </li>
          <li class="event-list-item" id="event-food">Selected food: ${eventFoodList}</li>
          <li class="event-list-item" id="event-music">Selected playlists: ${eventMusicList}</li>
        </ul>
        <button class="button is-rounded is-small is-primary is-responsive event-card-btn mb-5" id="event-card-btn"
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
