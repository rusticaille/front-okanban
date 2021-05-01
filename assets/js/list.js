const listModule =  {

    base_url: 'http://localhost:5050',

    makeListInDOM: (list) => {
        //Recup et clone du template
        const listTemplate = document.getElementById('newList');
        const clonedList = document.importNode(listTemplate.content, true);
    
        //Changement du nom et de l'id
        clonedList.querySelector('h2').textContent = list.name;
        clonedList.querySelector('.panel').setAttribute('data-list-id', list.id);
    
        //Ajout de la position dans le form
        let form = clonedList.querySelector('input[name="position"]').value = list.position;
    
        //Ajout de l'écouteur sur le bouton de création de carte
        clonedList.querySelector('.button--add-card').addEventListener('click', cardModule.showAddCardModal);
    
        //Ajout de l'écouter sur le h2 pour montrer le formulaire
        clonedList.querySelector('h2').addEventListener('dblclick', listModule.showEditListForm);
    
        //Ajout de l'écouteur sur le formulaire pour éditer la liste
        clonedList.querySelector('form').addEventListener('submit', listModule.editListForm);

        //Ajout de l'écouteur sur le bouton de suppression de liste
        clonedList.querySelector('.button--delete-list').addEventListener('click', listModule.showDeleteListModal);

        //Drag n drop des cartes
        let container = clonedList.querySelector('.panel-block');
        new Sortable(container, {
          group: "list",
          draggable: ".box",
          onEnd: (event) => cardModule.handleSortCard(event)
        });

        //Ajout de la liste au DOM
        const lastColumn = document.getElementById('addListButton').closest('.column');
        lastColumn.before(clonedList);
      },

    showAddListModal: () => {
      let modaleListDiv = document.getElementById('addListModal');
      modaleListDiv.classList.add('is-active');
      },

      showEditListForm: (event) => {
        //Faire apparaître le formulaire au double click
        let nameElement = event.target;
        let editListForm = nameElement.closest('div').querySelector('form');
        nameElement.classList.add('is-hidden');
        editListForm.classList.remove('is-hidden');
        
        //Mettre dans l'input le nom actuel
        let nameInput = editListForm.querySelector('input[name="name"]').value = nameElement.textContent;
        console.log('NameInput', nameInput);
      },

      handleAddListForm: async (event) => {

        event.preventDefault();
  
        //Création d'un formData sur le formulaire
        const formData = new FormData(event.target);
  
        //POST des données du formulaire et création de la nouvelle liste
        try{
          const response = await fetch(listModule.base_url + '/lists', {
            method: 'POST',
            body: formData
          });
          if(response.status !== 200){
            let error = await response.json();
            console.error(error);
          } else {
            let newList = await response.json();
            listModule.makeListInDOM(newList);
          }
        }catch (error) {
            alert("Impossible de créer une liste");
            throw error;
        }
  
        //Fermeture de la modale après avoir validé
        app.hideModals();
    },

    editListForm: async (event) => {
        event.preventDefault();

        //Création du dataForm
        let formData = new FormData(event.target);
    
        //Recup l'id de la liste
        let divWithId = event.target.closest('.panel');
        let listId = divWithId.getAttribute('data-list-id');
    
        //Recup du h2 de la liste
        let listName =divWithId.querySelector('h2');
    
        //Modification du nom de la liste
        try {
          const response = await fetch(listModule.base_url + '/lists/' + listId, {
            method: 'PATCH',
            body: formData
          });
          if(response.status !== 200){
            let error = await response.json();
            console.error(error);
          }else {
            let list = await response.json();
            listName.textContent = list.name;
          }
        }catch(error){
          alert('Impossible de modifier la liste');
          console.error(error);
        }
    
        //Cacher le form et rendre visible le h2.
        event.target.classList.add('is-hidden');
        listName.classList.remove('is-hidden');
      },

      showDeleteListModal: (event) => {

        //Recup l'id de la liste du template
        let listBox = event.target.closest('.panel');
        let listId = listBox.getAttribute('data-list-id');

        //Recup de l'id de la liste dans la modale
        let modalListDiv = document.getElementById('deleteListModal');
        modalListDiv.querySelector('input[name="id"]').value = listId;

        //afficher la modale
        modalListDiv.classList.add('is-active');

        //Listener sur le form pour suppression
        modalListDiv.querySelector('form').addEventListener('submit', listModule.handleDeleteList);
      },

      handleDeleteList: async (event) => {
        event.preventDefault();

        //Recup l'id de la liste
        const form = event.target.closest('form');
        const listId = form.querySelector('input[name="id"]').value;

        //Recup la liste correpondante
        let foundList = document.querySelector('[data-list-id="' + listId  + '"]');

        //Vérifier s'il y a une des cartes dans cette liste
        const list = document.querySelector('[data-list-id="' + listId + '"]');
        cardSearch = list.querySelectorAll('.box');

        //Supprimer la liste
        try {
          const response = await fetch(listModule.base_url + '/lists/' + listId, {
            method: 'DELETE'
          });
          if(response.status !== 200){
            let error = await response.json();
            console.error(error);
          }else {
            //S'il y a des cartes dans la liste, supprimer les cartes d'abord
            if(cardSearch.length > 0){
              alert('Il faut dabord supprimer les cartes !')
            } else {
              foundList.remove();
              let deletedList = await response.json();
            }
          }

        } catch (error){
          alert('impossible de supprimer cette liste');
          throw error;
        }

        app.hideModals();
      },

      initSortableForLists: () => {
        const sortableListContainer = document.getElementById('sortableListContainer');
        new Sortable(sortableListsContainer, {
          animation: 150,
          ghostClass: 'sortable-ghost'
        });
      },
}
