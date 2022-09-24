import React, {Component} from "react";

export default class EditSongModal extends Component{
    handleEditSong = (event) => {
        event.preventDefault();
        this.props.editSongCallback(this.props.editSongId - 1, this.props.oldSong);
    }

    render(){
        const {editSongCallback, hideEditSongModalCallback, editSongId, oldSong } = this.props;
        return(
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation = "slideInOutLeft">
                    <div class="modal-root" id='verify-edit-song-root'>
                        
                        <div class="modal-north">
                            Edit playlist?
                        </div>

                        <div class = "modal-center">
                            <div class="modal-center-content">
                                <div class = "edit-modal-content">
                                    <div id = "edit-song-title">
                                    Title:
                                    <input id = "edit-song-title-input"></input>
                                    </div>

                                    <div id = "edit-song-artist">
                                    Artist:
                                    <input id = "edit-song-artist-input"></input>
                                    </div>

                                    <div id = "edit-song-link">
                                    YouTube ID:
                                    <input id = "edit-song-link-input"></input>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class = "modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                class="modal-button" 
                                onClick={this.handleEditSong}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>

                    </div>
            </div>
        )
    }
}