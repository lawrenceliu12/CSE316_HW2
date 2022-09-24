import jsTPS_Transaction from "../common/jsTPS.js"

export default class MoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, songIndex, deletedSong) {
        super();
        this.app = initApp;
        this.songIndex = songIndex;
        this.deletedSong = deletedSong;
    }

    doTransaction() {
        this.app.deleteSong(this.songIndex);
    }
    
    undoTransaction() {
        this.app.addSongWithIndex(this.songIndex, this.deletedSong);
    }
}