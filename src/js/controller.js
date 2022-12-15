//! Main bridge between data operation and user interface

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
//? For support older browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import { MODAL_CLOSE_SEC } from './config.js';
//?Parcel functionality
// if (module.hot) {
//   module.hot.accept();
// }

//? function geting id of recipes, spiner,and reneder recipe to page
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    //? render spinner
    recipeView.renderSpinner();

    //* 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //* 1) Update bookmarksview
    bookmarksView.update(model.state.bookmarks);
    //*2) Loading recipe // model.js file get id for function
    await model.loadRecipe(id);
    //* 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //? 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;
    //? 2) Load search result
    await model.loadSearchResults(query);

    //? 3) Render results

    resultsView.render(model.getSearchResultsPage());

    //? Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

//? Publisher subscriber pattern
const controlPagination = function (goToPage) {
  //? 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //? Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //?Update the recipe servings (in state)

  model.updateServings(newServings);

  //? Update recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //? 1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //? 2) Update recipe view
  recipeView.update(model.state.recipe);

  //? 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //? Show loading spinner
    addRecipeView.renderSpinner();
    //? upload new recipe data
    await model.uploadRecipe(newRecipe);
    //? Render recipe
    recipeView.render(model.state.recipe);
    //? Success message
    addRecipeView.renderMessage();

    //? Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //? Change ID in URL (change url without reloading the whole page)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //? Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('❌', err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
