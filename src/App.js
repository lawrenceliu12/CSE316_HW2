import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import EditSongModal from './components/EditSongModal';
import DeleteSongModal from './components/DeleteSongModal';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            confirmDialog: false
        }
    }

    toggleConfirmDialogOpen = () => {
        this.state.confirmDialog = !this.state.confirmDialog;
        console.log(this.state.confirmDialog);
        return this.state.confirmDialogOpen;
    }

    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }

    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    //Open up the modal
    markSongForEdit = (songId) => {
        let editTitleId = document.getElementById("edit-song-title-input");
        let editArtistId = document.getElementById("edit-song-artist-input");
        let editLinkId = document.getElementById("edit-song-link-input");
        
        let song = this.state.currentList.songs[songId - 1];
        let title = song.title;
        let artist = song.artist;
        let link = song.youTubeId;
        
        editTitleId.value = title;
        editArtistId.value = artist;
        editLinkId.value = link;

        this.setState(prevState =>({
            currentList: prevState.currentList,
            songIdMarkedForEdit: songId,
            oldSong: song,
            sessionData: prevState.sessionData
        }), () => {
            this.showEditSongModal();
        });
    }

    //Editting the database
    editSong = (key, newTitle, newArtist, newLink) => {
        let currentList = this.state.currentList;
        // console.log(currentList.key);

        // let newTitle = document.getElementById("edit-song-title-input").value;
        // let newArtist = document.getElementById("edit-song-artist-input").value;
        // let newLink = document.getElementById("edit-song-link-input").value;

        this.setState(prevState => {
            currentList.songs[key] = 
                {
                    title: newTitle,
                    artist: newArtist,
                    youTubeId: newLink,
                };
            return ({
                currentList: currentList
            })
        }, () => {
            // EDITING THE SONG IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            // console.log("Key 1:", key);
            // console.log("\n\n", this.state.currentList, "\n\n");
            this.db.mutationEditSong(key, currentList.key, currentList.songs[key-1]);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    //Confirmation for modal
    editMarkedSong = () => {
        this.hideEditSongModal();
        this.editSong(this.state.songIdMarkedForEdit);
    }

    markSongForDelete = (songId) => {
        let song = this.state.currentList.songs[songId - 1];
        this.setState(prevState => {
            return ({
                currentList: prevState.currentList,
                songIdMarkedForDelete: songId,
                songMarkedForDelete: song,
                sessionData: prevState.sessionData
            })},() => {
                this.showDeleteSongModal();
        });
    }

    deleteSong = (songId) => {
        let currentList = this.state.currentList;
        if (songId >= 0){
            currentList.songs.splice(songId, 1);
        }
        
        this.setState(prevState => {
            return ({
                currentList: currentList
            })
        }, () => {
            this.db.mutationDeleteSong(currentList.key, currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    //Unused from now on -- once you start transactions
    deleteMarkedSong = () => {
        this.hideDeleteSongModal();
        this.deleteSong(this.state.songIdMarkedForDelete - 1);
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.toggleConfirmDialogOpen();
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () =>{
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.toggleConfirmDialogOpen();
    }

    //THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER TO EDIT SONG
    showEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        this.toggleConfirmDialogOpen();
    }

    // THIS FUNCTION IS FOR HIDING THE EDIT SONG MODAL
    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.toggleConfirmDialogOpen();
    }

    //THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER TO DELETE SONG
    showDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        this.toggleConfirmDialogOpen();
    }

    //THIS FUNCTION IS FOR HIDING THE DELETE SONG MODAL
    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.toggleConfirmDialogOpen();
    }

    addSong = () =>{
        let currList = this.state.currentList;
        if (currList){
            let newSong = {
                title: "Untitled",
                artist: "Unknown",
                youTubeId: "dQw4w9WgXcQ"
            };

            currList.songs.push(newSong);
            this.setState(prevState => {
                return ({
                    currentList: currList
                });
            }, () => {
                this.db.mutationUpdateList(this.state.currentList);
                this.db.mutationUpdateSessionData(this.state.sessionData);
            });
        }
    }

    addSongWithIndex = (deletedSongIndex, deletedSong) => {
        let currList = this.state.currentList;
        if (currList){
            currList.songs.splice(deletedSongIndex, 0, deletedSong);
        }
        this.setState(prevState => {
            return ({
                currentList: currList
            })
        }, () => {
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    
    //TRANSACTIONS START HERE
    addSongTransaction = (addSongIndex) =>{
        let transaction = new AddSong_Transaction(this, addSongIndex);
        this.tps.addTransaction(transaction);
    }

    deleteSongTransaction = (songIndex, deletedSong) => {
        let transaction = new DeleteSong_Transaction(this, songIndex, deletedSong);
        this.tps.addTransaction(transaction);
        this.hideDeleteSongModal();
    }

    editSongTransaction = (songIndex, oldSong) => {
        let newTitle = document.getElementById("edit-song-title-input").value;
        let newArtist = document.getElementById("edit-song-artist-input").value;
        let newLink = document.getElementById("edit-song-link-input").value;

        let transaction = new EditSong_Transaction(this, songIndex, newTitle, newArtist, newLink, oldSong);
        this.tps.addTransaction(transaction);
        this.hideEditSongModal();
    }

    ctrlFunction = (event) => {
        if (event.ctrlKey && event.key === 'z'){
            this.undo();
        }
        else if (event.ctrlKey && event.key === 'y'){
            this.redo();
        }
    }

    render() {
        let canAddList = this.state.currentList === null;
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        return (
            <div id="root" onKeyDown = {this.ctrlFunction}>
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList = {canAddList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback = {this.addSongTransaction}
                    playlist = {this.state.currentList}
                    confirmDialogOpen = {this.state.confirmDialog}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    editSongCallback={this.markSongForEdit}
                    deleteSongCallback = {this.markSongForDelete}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    hideEditSongModalCallback={this.hideEditSongModal}
                    // editSongCallback={this.editMarkedSong}
                    editSongCallback = {this.editSongTransaction}
                    editSongId = {this.state.songIdMarkedForEdit}
                    oldSong = {this.state.oldSong}
                />
                <DeleteSongModal
                    song = {this.state.songMarkedForDelete}
                    hideDeleteSongModalCallback = {this.hideDeleteSongModal}
                    // deleteSongCallback = {this.deleteMarkedSong}
                    deleteSongCallback = {this.deleteSongTransaction}
                    songId = {this.state.songIdMarkedForDelete}
                /> 
            </div>
        );
    }
}

export default App;
