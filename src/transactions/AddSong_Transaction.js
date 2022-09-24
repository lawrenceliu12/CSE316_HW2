import jsTPS_Transaction from "../common/jsTPS.js"

export default class MoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, addSongIndex) {
        super();
        this.app = initApp;
        this.addSongIndex = addSongIndex;
    }

    doTransaction() {
        this.app.addSong();
    }
    
    undoTransaction() {
        this.app.deleteSong(this.addSongIndex);
    }
}