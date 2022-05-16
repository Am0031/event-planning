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
          data-pic="${playlistCover}" data-type="music"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
        <a
          href=${linkUrl}
          class="card-footer-item"
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
    musicContainer.click(handleItemSelection);
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
          data-pic="${recipeImage}" data-type="food">
          <i class="fa-solid fa-plus"></i>
        </button>
        <a
          href=${linkUrl}
          class="card-footer-item"
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
    foodContainer.click(handleItemSelection);
  } else {
    // render error
    renderError("No results found.", foodContainer);
  }
};

const handleEditClick = () => {
  //get event from local storage
  //empty main container
  //render food section
  //populate the aside list with the food selection already in storage in the event
};

const renderEventCard = () => {
  emptyContainer("main");

  const tempName = currentEventName;
  const myEvents = getFromLocalStorage("myEvents");
  const currentEventIndex = myEvents.findIndex(
    (obj) => obj.eventName === tempName
  );
  const currentEvent = myEvents[currentEventIndex];
  const eventName = currentEvent.eventName;
  const eventDate = currentEvent.eventDate;
  const eventLocation = currentEvent.eventLocation;
  const eventDescription = currentEvent.eventDescription;
  const eventOrganiser = currentEvent.eventOrganiser;
  const organiserEmail = currentEvent.organiserEmail;

  $("#main").append(`<section class="event-card-section has-text-centered">
  <div class="card-design event-card-container m-5">
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
    <button class="button print-btn is-rounded is-big m-2" id="print-btn">
      Print this event card
    </button>
    <button
      class="button selection-btn is-rounded is-big m-2"
      id="selection-btn"
      data-value="selection-edit"
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
  currentEventName = "";
};

//Handling form submit in music-container section - Spotify api call
const handleMusicSubmit = async (event) => {
  try {
    event.preventDefault();

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
  //need to add the handling of "surprise me"
  try {
    event.preventDefault();

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

  $("#music-aside").click(renderEventCard);
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

  $("#food-aside").click(renderMusicSection);
};

//function to save the event details form into local storage and trigger render Food section
const saveEventDetails = (e) => {
  e.preventDefault();
  const eventName = $("#event-name-input").val();
  const eventOrganiser = $("#event-organiser").val();
  const organiserEmail = $("#organiser-mail").val();
  const eventLocation = $("#event-location").val();
  const eventDate = $("#event-date").val();
  const eventDescription = $("#event-description").val();
  const eventObj = {
    eventName,
    eventOrganiser,
    organiserEmail,
    eventLocation,
    eventDate,
    eventDescription,
  };

  const arrayFromLs = getFromLocalStorage("myEvents", []);

  const plannedEvent = arrayFromLs.findIndex((s) => s.eventName === eventName);

  if (plannedEvent > -1) {
    alert("This Event already exists!");
  } else {
    arrayFromLs.push(eventObj);
    writeToLocalStorage("myEvents", arrayFromLs);

    currentEventName = eventName;
    renderFoodSection();
  }
};

//function to remove the start page and render the event details form
const renderForm = () => {
  removeContainer("start-page-section");
  $("#main").append(`<section class="section" id="event-details-section">
  <div class="container is-mobile" id="event-details-container">
    <h2 id="event-details-message" class="title event-details-message">
      Enter details of your event
    </h2>
    <div>
      <form class="event-details-form" id="event-details-form">
        <div class>
          <label class="input-label" for="input"
            >What would you like to call your event?</label
          >
          <input
            type="text"
            class="input is-normal event-name-input mb-5"
            id="event-name-input"
            name="event-name"
            placeholder="Give your event a name"
          />
        </div>
        <div>
          <!-- <div class="input-container"> -->
          <label class="input-label" for="event-organiser"
            >Event organiser</label
          >
          <input
            type="text"
            class="input is-normal event-input mb-5"
            id="event-organiser"
          />
        </div>
        <div class="input-container">
          <label class="input-label" for="organiser-mail"
            >Event organiser's email</label
          >
          <input
            type="email"
            class="input is-normal event-input mb-5"
            id="organiser-mail"
          />
        </div>
        <div class="my-2 input-container">
          <label class="input-label" for="event-location"
            >Event location</label
          >
          <input
            type="text"
            class="input is-normal event-input mb-5"
            id="event-location"
          />
        </div>
        <div class="input-container">
          <label class="input-label" for="event-date">Event date</label>
          <input
            type="date"
            class="input is-normal mb-5"
            id="event-date"
          />
        </div>
        <div class="my-4 input-container">
          <label class="input-label" for="event-description"
            >Detailed description of my event</label
          >
          <textarea
            id="event-description"
            class="input is-normal description"
            placeholder="Add description"
          ></textarea>
        </div>
        <div class="form-button-div has-text-centered m-0">
          <button
            class="button is-rounded is-medium has-text-centered is-primary is-responsive"
            type="submit"
            id="event-details-btn"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</section>`);
  //need to change to proper form validation (.submit and validation classes etc)
  $("#event-details-btn").click(saveEventDetails);
};

//Handling start page click
const handleStartClick = () => {
  //bring up modal window with event details form
  //submit form in modal
  //save form details in local storage
  //remove start container
  //render food selection container (includes aside div)
  //add click event to food form submit button --> handle button click (submit or surprise) --> handle food submit --> returns rendered cards
  //on click of "add" symbol on the card, recipe name is added to the event's local storage object and the side list is re-rendered with updated local storage info
  //on click of "continue" button, remove food container and render music container
  //add click event to music form button --> handle music submit --> return rendered cards
  //on click of "add" symbol on the card, recipe name is added to the event's local storage object and the side list is re-rendered with updated local storage info
  //on click of "continue" button, remove music container and render event card template
  //on click of "print" button, the print option opens (to look into!!!)
};

// On load
const onReady = () => {
  //event listener for mobile burger bar menu for html pages -Youtube NetNinja Bulma
  burgerIcon.click(() => {
    navbarMenu.toggleClass("is-active");
  });

  //add click event to start button
  $("#start-page-btn").click(renderForm);
};

$(document).ready(onReady);
