import React, {Component} from "react";

export default class DeleteSongModal extends Component{
    render(){
        const {song, deleteSongCallback, hideDeleteSongModalCallback} = this.props;
        let title = "";
        if (song) {
            title = song.title;
        }
        return (
            <div
                className = "modal"
                id = "delete-song-modal"
                data-animation = "slideInOutLeft">
                    <div class = "modal-root" id = "verify-delete-song-root">

                        <div class = "modal-north">
                            Delete song?
                        </div>

                        <div class = "modal-center">
                            <div class = "modal-center-content">
                                {/* TODO: Make sure to add name by artist. figure out later */}
                                Are you sure you wish to permanently delete {<b>{title}</b>}?
                            </div>
                        </div>
                        
                        <div class = "modal-south">
                            <input type = "button"
                                id = "delete-song-confirm-button"
                                class = "modal-button"
                                onClick = {deleteSongCallback}
                                value = "Confirm" />
                            <input type = "button"
                                id = "delete-song-cancel-button"
                                class = "modal-button"
                                onClick = {hideDeleteSongModalCallback}
                                value = "Cancel" />

                        </div>
                    </div>
            </div>
        )
    }
}