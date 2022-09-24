import jsTPS_Transaction from "../common/jsTPS.js"

export default class MoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, songIndex, newTitle, newArtist, newLinkId, oldSong) {
        super();
        this.app = initApp;
        this.songIndex = songIndex;
        this.newTitle = newTitle;
        this.newArtist = newArtist;
        this.newLinkId = newLinkId;
        this.oldSong = oldSong;
    }

    doTransaction() {
        this.app.editSong(this.songIndex, this.newTitle, this.newArtist, this.newLinkId);
    }
    
    undoTransaction() {
        this.app.editSong(this.songIndex, this.oldSong.title, this.oldSong.artist, this.oldSong.youTubeId);
    }
}