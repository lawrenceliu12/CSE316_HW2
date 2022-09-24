import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        const { createNewListCallback, addListButton } = this.props;
        createNewListCallback();
    };

    enableButton = (buttonClass) => {
        return buttonClass.replace("-disabled", "");
    }

    render() {
        let addListButton = "toolbar-button-disabled";
        if (this.props.canAddList){
            addListButton = this.enableButton(addListButton);
        }

        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className={addListButton} 
                    onClick={this.handleClick}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}