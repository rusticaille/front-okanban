
var app = {

  base_url: 'http://localhost:5050',

  init: () => {
    console.log('app.init !');
    app.addListenerToActions();
    app.getListsFromAPI();
    listModule.initSortableForLists();
    // cardModule.initSortableForCards();
  },

  getListsFromAPI: async function () {
    const response = await fetch(app.base_url + '/lists');

    try {
        if (response.status !== 200) {
            let error = await response.json();
            console.error(error);
        } else {
            let lists = await response.json();
            for (const list of lists) {
              listModule.makeListInDOM(list);
                for (const card of list.cards) {
                    //console.log(card);
                    cardModule.makeCardInDOM(card.title, list.id, card.id, card.color);
                    for(const label of card.labels){
                      //console.log('label:', label);
                      labelModule.makeLabelInDOM(label.name, label.id, label.color, label.text_color, card.id);
                    }
                }
            }
        }
    } catch (error) {
        alert("Impossible de charger les listes depuis l'API.");
        console.error(error);
    }
},

  addListenerToActions : () => {
    //AJOUT DE LISTE
    const modalButton = document.getElementById('addListButton');
    modalButton.addEventListener('click', listModule.showAddListModal);

    //AJOUT DE CARTE
    const modalCardButton = document.querySelectorAll('a.is-pulled-right');
    for(var i = 0; i < modalCardButton.length; i++){
      modalCardButton[i].addEventListener('click', cardModule.showAddCardModal);
    }

    //SUPPRESSION D'UN LABEL
    const labelModalButton = document.getElementById('deleteLabelButton');
    labelModalButton.addEventListener('click', labelModule.showDeleteLabelModal);

    //FERMETURE DES MODALES
    const closeButtons = document.querySelectorAll(".close");
    for(var i = 0; i < closeButtons.length; i++){
      closeButtons[i].addEventListener('click', app.hideModals);
    }

    //FORMULAIRE DE CREATION DE LISTE
    const listForm = document.querySelector('div.modal-card form');
    listForm.addEventListener('submit', listModule.handleAddListForm);

    //FORMULAIRE DE CREATION DE CARTE
    const cardForm = document.querySelector('.card-form');
    cardForm.addEventListener('submit', cardModule.handleAddCardForm);
  },

  hideModals: () => {
    let allModals = document.querySelectorAll(".modal");
    allModals.forEach(modal => modal.classList.remove('is-active'));
    if('card-name-input'){
      document.getElementById('card-name-input').value = '';
    }
    if('list-name-input'){
      document.getElementById('list-name-input').value = '';
    }
  },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );