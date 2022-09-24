import React from "react";

export default class EditToolbar extends React.Component {
    handleAddSong = (event) => {
        event.preventDefault();
        let addSongIndex = this.props.playlist.songs.length;
        // console.log(this.props.playlist.songs.length);

        this.props.addSongCallback(addSongIndex);
    }

    enableButton = (buttonClass) => {
        return buttonClass.replace("-disabled", "");
    }

    render() {
        const { canAddSong, canUndo, canRedo, canClose, 
                undoCallback, redoCallback, closeCallback, addSongCallback, playlist, confirmDialogOpen} = this.props;

        let addSongClass = "toolbar-button-disabled";
        let undoClass = "toolbar-button-disabled";
        let redoClass = "toolbar-button-disabled";
        let closeClass = "toolbar-button-disabled";

        if (playlist){
            if (confirmDialogOpen === false){
                if (canAddSong){
                    addSongClass = this.enableButton(addSongClass);
                }
                if (canClose){
                    closeClass = this.enableButton(closeClass);
                }
                if (canUndo){
                    undoClass = this.enableButton(undoClass);
                }
                if (canRedo){
                    redoClass = this.enableButton(redoClass);
                }
            }
        }

        // if (canAddSong) addSongClass += " disabled";
        // if (canUndo) undoClass += " disabled";
        // if (canRedo) redoClass += " disabled";
        // if (canClose) closeClass += " disabled";

        return (
            <div id="edit-toolbar">
            <input 
                type="button" 
                id='add-song-button' 
                value="+" 
                onClick = {this.handleAddSong}
                className={addSongClass}
            />
            <input 
                type="button" 
                id='undo-button' 
                value="⟲" 
                className={undoClass} 
                onClick={undoCallback}
            />
            <input 
                type="button" 
                id='redo-button' 
                value="⟳" 
                className={redoClass} 
                onClick={redoCallback}
            />
            <input 
                type="button" 
                id='close-button' 
                value="&#x2715;" 
                className={closeClass} 
                onClick={closeCallback}
            />
        </div>
        )
    }
}