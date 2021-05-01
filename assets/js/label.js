const labelModule = {

    base_url: 'http://localhost:5050',

    makeLabelInDOM: (labelName, labelId, labelColor, labelTextColor, cardId) => {
        //Recup et clone du template
        const labelTemplate = document.getElementById('newLabel');
        console.log("labelTemplate:", labelTemplate);
        const clonedLabel = document.importNode(labelTemplate.content, true);
        console.log("clonedLabel", clonedLabel);
    
        //Changement du nom, id et color
        clonedLabel.querySelector('p').textContent = labelName;
        let labelDiv = clonedLabel.querySelector('div');
        labelDiv.setAttribute('data-label-id', labelId);
        labelDiv.style.backgroundColor = labelColor;
        labelDiv.style.color = labelTextColor;
        labelDiv.querySelector('input').value = cardId;
        console.log("labelDiv:", labelDiv);

        //Ecouteur pour la suppression du DOM
        const deleteIcon = clonedLabel.querySelector('.fa-times').closest('span');
        deleteIcon.addEventListener('click', labelModule.removeLabelFromCard);

        //Recup de la carte associée
        const associateCard = document.querySelector('[data-card-id="' + cardId  + '"]');
    
        //Lui rattacher le nouveau label.
        associateCard.querySelector('div.label-column').appendChild(clonedLabel);
        console.log('carte associée',associateCard);
    },

    showAddLabelModal: (event) => {
        //Recup l'id de la carte cliquée
        const cardBox = event.target.closest('.box');
        const cardId = cardBox.getAttribute('data-card-id');
        console.log("cardId de la carte cliquée:", cardId);

        //Récup la modale et insérer l'id de la carte cliquée
        const labelModal = document.getElementById('addLabelModal');
        let input = labelModal.querySelector('input[name="card_id"]');
        console.log("input card_id de la modale:", input);
        input.value = cardId;
        console.log("valeur de l'input:", input.value);

        //Récup tous les labels existants pour les afficher dans la modale
        labelModule.getAllExistingLabel(cardId);
        
        //Afficher  la modale
        labelModal.classList.add('is-active');

        //FORMULAIRE D'AJOUT /MODIFICATION D'UNE CATEGORIE
        const labelForm = document.querySelector('.label-form');
        labelForm.addEventListener('submit', labelModule.handleAddLabelModal);
    },

    //Ajouter/modifier un label depuis la modale
    handleAddLabelModal : async (event) => {
        event.preventDefault();

        //Création du formData
        const formData = new FormData(event.target);
        console.log('event.target:',event.target);

        //Recup de l'id de la carte dans la modale
        const cardIdInput = event.target.querySelector('input[name="card_id"]');
        console.log(cardIdInput);
        const cardId = cardIdInput.value;
        console.log('cardId dans handleAddLabel:', cardId);

        //Vérifier s'il y a déjà un label dans la carte
        //Retrouver la carte qui a la cardId
        let associatedCardInDOM = document.querySelector('[data-card-id="' + cardId  + '"]');
        //Aller chercher la label_column
        let labelContainer = associatedCardInDOM.querySelector('.label-column');
        console.log('labelContainer:', labelContainer);

        if(labelContainer.querySelector('.new-label')){
            console.log('déjà un label sur cette carte');
            alert(`Cette carte a déjà un label, veuillez d'abord le supprimer`);
        } else {
            try{
                //Post du formulaire et création du label
                const response = await fetch(labelModule.base_url + '/labels/', {
                    method: 'POST',
                    body: formData
                });
                if(response.status !== 200){
                    let error = await response.json();
                    console.error(error);
                }else {
                    let newLabel = await response.json();
                    console.log('newLabel dans handleAddLabel:', newLabel);
                    labelModule.associateLabelToCard(newLabel.id, cardId);
                    labelModule.makeLabelInDOM(newLabel.name, newLabel.id, newLabel.color, newLabel.text_color, cardId);
                 }
                }catch (error) {
                    alert("Impossible de créer ce label");
                    throw error;
                }  
        }
        //Fermeture de la modale
        app.hideModals();
    },

    associateLabelToCard: async (labelId, cardId) => {
        //Création d'un formData contenant le labelId
        const formData = new FormData();
        formData.append('label_id',labelId);

        //Association du label et de la carte
        try{
            const response = await fetch(labelModule.base_url + '/cards/' + cardId + '/label', {
                method: 'POST',
                body: formData
            });
            if(response.status !== 200){
                let error = await response.json();
                console.error(error);
            }else {
                let cardWithLabel = await response.json();
                // 1 : supprimer les "vieux" tags 
                let oldTags = document.querySelectorAll(`[data-card-id="${cardWithLabel.id}"] .tag`);
                for (let tag of oldTags) {
                    tag.remove();
                }
                // 2 : créer les nouveaux!
                let container = document.querySelector(`[data-card-id="${cardWithLabel.id}"] .label-column`);
                for (let label of cardWithLabel.labels){
                    labelModule.makeLabelInDOM(label.name, label.id, label.color, label.text_color, cardId);
                }
            }

        }catch (error) {
            alert("Impossible d'associer cette carte et ce label");
            throw error;
        }

    },

    getAllExistingLabel:async (cardId) => {
        //Récup de tous les labels existants dans la BDD
        try  {
            const response = await fetch(labelModule.base_url + '/labels')
            if (response.status !== 200) {
                let error = await response.json();
                console.error(error);
            } else {
                let allExistingLabel = await response.json();
                for(const label of allExistingLabel){
                    console.log(label);
                    labelModule.makeLabelInModale(label, cardId);
                }
            }
        }catch (error) {
            alert("Impossible de récupérer les labels existants");
            throw error;
        }
    },

    makeLabelInModale: (label, cardId) => {

        //Recup de la div dans laquelle vont venir s'insérer les labels
        let labelsParent = document.querySelector('.existing-labels');

        //Si les labels y ont déjà été créés on ne fait rien, sinon on les créé.
        if(labelsParent.querySelector('[data-label-id="' + label.id  + '"]')){
            console.log('labels déjà là');

            //Recup de l'input hidden et mettre à jour la cardId
            let labelElement = labelsParent.querySelector('[data-label-id="' + label.id  + '"]')
            labelElement.querySelector('input').value = cardId;
            console.log('mise à jour du cardId de la carte cliquée', (labelElement.querySelector('input').value));
            return;

         } else {
             //Recup et clone du template
             const labelTemplate = document.getElementById('newLabel');
             const clonedLabel = document.importNode(labelTemplate.content, true);
 
             //Changement du nom, id et color
             clonedLabel.querySelector('p').textContent = label.name;
             clonedLabel.querySelector('div').setAttribute('data-label-id', label.id);
             clonedLabel.querySelector('div').style.backgroundColor = label.color;
             clonedLabel.querySelector('div').style.color = label.text_color;

             //Suppression du span avec l'icône
             let labelSpan = clonedLabel.querySelector("span");
             labelSpan.remove();

             //Recup de l'input hidden et lui mettre la cardId de la carte cliquée
             clonedLabel.querySelector('input').value = cardId;
             console.log('cardId de la carte dou vient le formulaire est là', (clonedLabel.querySelector('input').value));

             //Ajout de l'écouteur sur les labels pour pouvoir les ajouter aux cartes.
             clonedLabel.querySelector('div').addEventListener('click', labelModule.getIdsAndAssociate);

             //Récup de la div dans laquelle insérer les labels
            document.querySelector('.existing-labels').appendChild(clonedLabel);
        }   
    },

    getIdsAndAssociate: (event) => {
        event.preventDefault();
        console.log('un label existant a été cliqué:', event.target);

        let targetDiv = event.target.closest('div');

        //Recup du labelId et du cardId
        let labelId = targetDiv.getAttribute('data-label-id');
        console.log('labelId:', labelId);

        let cardId = targetDiv.querySelector('input[value]').value;
        console.log('cardId:', cardId);

        labelModule.associateLabelToCard(labelId, cardId);
        app.hideModals();
    },

    removeLabelFromCard: async (event) => {
        event.preventDefault();

        //Retirer label du DOM
        let LabelToRemove = event.target.closest('div');
        console.log('LabelToRemove:', LabelToRemove);
        LabelToRemove.remove();
        console.log('suppression du label du DOM');

        //récuper l'id du label et de la carte
        let labelId = LabelToRemove.getAttribute('data-label-id');
        let cardId = LabelToRemove.querySelector('[value]').value;

        try {
            const response = await fetch(labelModule.base_url + '/cards/' + cardId + '/label/' + labelId, {
                method: 'DELETE'
            });
            if(response.status !==200){
                let error = await response.json();
                console.error(error);
              } else {
                let deletedLabel = await response.json();
                console.log('le label e bien été supprimé:', deletedLabel);
              }
        }catch (error){
            alert("Impossible de supp le label avec l'id:" + labelId);
            throw error;
          }
    },

    showDeleteLabelModal: () => {
        let deleteLabelDiv = document.getElementById('deleteLabelModal');
        deleteLabelDiv.classList.add('is-active');
        labelModule.makeDeleteLabelForm();
    },

    makeDeleteLabelForm: async () => {
        //Si les labels ont déjà été créés dans la modal on les enlève avant de les recréer.
        if(document.querySelectorAll('.label-to-delete')){
            document.querySelector('.all-labels').innerHTML = "";
        }

        //Récup de tous les labels existants dans la BDD
        try  {
            const response = await fetch(labelModule.base_url + '/labels')
            if (response.status !== 200) {
                let error = await response.json();
                console.error(error);
            } else {
                let allExistingLabel = await response.json();
                let container = document.querySelector('.all-labels');
                console.log('container:', container);
                for(const label of allExistingLabel){
                    console.log(label);

                    //Création du form pour chaque label
                    let form = document.createElement("form");
                    form.setAttribute('data-label-id', label.id);
                    form.setAttribute('class', 'label-to-delete');
                    container.appendChild(form);
                    
                    //Création du bouton pour chaque label
                    let labelButton = document.createElement('input');
                    labelButton.setAttribute("type", "button");
                    labelButton.setAttribute("value", label.name);
                    labelButton.classList.add('delete-modal-label');
                    labelButton.style.backgroundColor = label.color;
                    labelButton.style.color = label.text_color;
                    form.appendChild(labelButton);
                    console.log('container:', container);

                    //Création du submit pour chaque label
                    let deleteButton = document.createElement('input');
                    deleteButton.setAttribute("type", "submit");
                    deleteButton.classList.add('button-delete-label');
                    deleteButton.classList.add('is-danger');
                    deleteButton.setAttribute("value", 'Supprimer');
                    form.appendChild(deleteButton);

                    //Ajout du listener sur le submit
                    form.addEventListener('submit', labelModule.deleteLabelFromDatabase);

                }
                const modal = document.getElementById('deleteLabelModal');
                modal.querySelector('.all-labels').replaceWith(container);
            }
        }catch (error) {
            alert("Impossible de récupérer les labels existants");
            throw error;
        }
    },

    deleteLabelFromDatabase: async (event) => {
        event.preventDefault();

        //Récup du labelId
        const form = event.target.closest('form');
        const labelId = form.getAttribute('data-label-id');

        //Suppression de tous les labels a supprimer dans le DOM
        let labelsToDelete = document.querySelectorAll(`[data-label-id="${labelId}"]`);
        for(const label of labelsToDelete){
            label.parentElement.removeChild(label);         
        }
        
        try {
            const response = await fetch(labelModule.base_url + '/labels/' + labelId, {
                method: 'DELETE'
        });
        if (response.status !== 200) {
            let error = await response.json();
            console.error(error);
        } else {
            let deletedLabel = await response.json()
            console.log('le label :' + deletedLabel + ' a bien été supprimé.')
        }
        } catch (error){
            alert("Impossible de supp le label avec l'id:" + labelId);
            throw error;
        }
        app.hideModals();
    }


}