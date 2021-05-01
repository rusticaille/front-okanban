const cardModule = {

    base_url: 'http://localhost:5050',

    makeCardInDOM: (cardName, listId, cardId, cardColor) => {
        //Recup et clone du template
        const cardTemplate = document.getElementById('newCard');
        const clonedCard = document.importNode(cardTemplate.content, true);
    
        //Changement du nom, id et color
        clonedCard.querySelector('.new-card-name').textContent = cardName;
        clonedCard.querySelector('.box').setAttribute('data-card-id', cardId);
        clonedCard.querySelector('.box').setAttribute('style', 'background-color: ' + cardColor);
    
        //Ajout de l'écouteur sur l'icône crayon de la carte
        const pencilIcon = clonedCard.querySelector('.fa-pencil-alt').closest('span');
        pencilIcon.addEventListener('click', cardModule.showEditCardForm);
    
        //Ajout de l'écouteur sur le formulaire de modification de la carte
        const editCardForm = clonedCard.querySelector('form');
        editCardForm.addEventListener('submit', cardModule.editCardForm);

        //Ajout de l'écouteur sur l'icone de suppression
        const trashIcon = clonedCard.querySelector('.fa-trash-alt').closest('span');
        trashIcon.addEventListener('click', cardModule.showDeleteCardModal);

        //Ajout de l'écouteur sur l'icone de label
        const labelIcon = clonedCard.querySelector('.fa-tag').closest('span');
        labelIcon.addEventListener('click', labelModule.showAddLabelModal);
    
        //Recup de la liste associée
        //console.log('carte créée:', clonedCard);
        const associateList = document.querySelector('[data-list-id="' + listId  + '"]');
        //console.log('liste associée',associateList)
    
        //Lui rattacher la nouvelle liste
        associateList.querySelector('div.panel-block').appendChild(clonedCard);
      }, 

    showAddCardModal:(event) => {
        const listElement = event.target.closest('.panel');
        const listId = listElement.getAttribute('data-list-id');
    
        const modaleCardDiv = document.getElementById('addCardModal');
        let input = addCardModal.querySelector('input[name="list_id"]');
        input.value = listId;
    
        modaleCardDiv.classList.add('is-active');
    },

    handleAddCardForm: async (event) => {
        event.preventDefault();
  
        //Création du formData
        const formData = new FormData(event.target);
  
        //Post du formulaire et création de la carte
        try {
          const response = await fetch(cardModule.base_url + '/cards', {
            method: 'POST',
            body: formData
          });
          if(response.status !== 200){
            let error = await response.json();
            console.error(error);
          }else {
            let newCard = await response.json();
            cardModule.makeCardInDOM(newCard.title, newCard.list_id, newCard.id, newCard.color);
          }
  
        } catch (error) {
            alert("Impossible de créer une carte");
            throw error;
        }
  
        //Fermeture de la modale
        app.hideModals();
    },

    showEditCardForm: (event) => {
        //console.log('cliqué!');
        event.preventDefault();
        console.log('event.target:', event.target);
        
        //Recup du titre et du formulaire
        let cardBox = event.target.closest('.box');
        let cardTitle = cardBox.querySelector('.new-card-name');
        let editCardForm = cardBox.querySelector('form');
    
        //Remplir le formulaire avec le titre actuel
        editCardForm.querySelector('input[name="title"]').value = cardTitle.textContent;
    
        //Rendre le formulaire visible
        cardTitle.classList.add('is-hidden');
        editCardForm.classList.remove('is-hidden');
    },

      editCardForm: async (event) => {
        event.preventDefault();
    
        //Création du Formdata
        const formData = new FormData(event.target);
    
        //Recup de l'id de la carte
        let cardBox = event.target.closest('.box');
        let cardId = cardBox.getAttribute('data-card-id');
    
        //Recup de l'emplacement du titre
        let cardTitle = cardBox.querySelector('.new-card-name');
    
        try{
    
          const response = await fetch(cardModule.base_url + '/cards/' + cardId, {
            method: 'PATCH',
            body: formData
          });
          if(response.status !== 200){
            let error = await response.json();
            console.log(error);
          }else {
            let card = await response.json();
            cardTitle.textContent = card.title;
            console.log('cardTitle:', cardTitle);
          }
        }catch(error){
          alert('Impossible de modifier la carte');
          console.error(error);
        }
    
        //Refermer le formulaire
        event.target.classList.add('is-hidden');
        cardTitle.classList.remove('is-hidden');
        console.log(cardTitle);
    
    },

    showDeleteCardModal : (event) => {
      event.preventDefault();

      //Recup l'id de la carte dans le template
      let cardBox = event.target.closest('.box');
      let cardId = cardBox.getAttribute('data-card-id');

      //Recup l'input de la modale contenant l'id de la carte + insertion
      let modaleCardDiv = document.getElementById('deleteCardModal');
      modaleCardDiv.querySelector('input[name="id"]').value = cardId;

      //Afficher la modale
      modaleCardDiv.classList.add('is-active');

      //Listener sur le submit
      modaleCardDiv.querySelector('form').addEventListener('submit', cardModule.handleDeleteCard);
      console.log(modaleCardDiv.querySelector('form'));
    },

    handleDeleteCard: async (event) => {
      event.preventDefault();

      //Récupérer l'id de la carte
      const form = event.target.closest('form');
      const cardId = form.querySelector('input[name="id"]').value;

      //Récupérer la carte correspondante et la supprimer du DOM
      let foundCard = document.querySelector('[data-card-id="' + cardId  + '"]');
      console.log("foundCard:", foundCard);
      foundCard.remove();

      //Supprimer la carte de la BDD
      try{
        const response = await fetch(cardModule.base_url + '/cards/' + cardId,  {
               method: 'DELETE'
        });
        if(response.status !==200){
          let error = await response.json();
          console.error(error);
        } else {
            let deletedCard = await response.json();
            console.log('deletedCard:', deletedCard);
        }
      } catch (error){
        alert("Impossible de supprimer la carte avec l'id:" + cardId);
        throw error;
      }

      //Fermer la modale
      app.hideModals();

      },

      handleSortCard: (event) => {
        let cardElement = event.item;
        let originList = event.from;
        let targetList = event.to;
    
        // on fait les bourrins : on va re-parcourir les 2 listes, pour mettre à jour chacune des cartes !
        let cards = originList.querySelectorAll('.box');
        let listId = originList.closest('.panel').getAttribute('data-list-id');
        cardModule.updateAllCards(cards, listId);
    
        if (originList !== targetList) {
          cards = targetList.querySelectorAll('.box')
          listId = targetList.closest('.panel').getAttribute('data-list-id');
          cardModule.updateAllCards(cards, listId);
        }
      },

      updateAllCards:(cards, listId)=> {
        cards.forEach((card, position) => {
          const cardId = card.getAttribute('data-card-id');
          let data = new FormData();
          data.set('position', position);
          data.set('list_id', listId);
          fetch(cardModule.base_url + '/cards/' + cardId, {
            method: "PATCH",
            body: data
          });
        });
      }
    }
