import React from 'react';
import {Link} from 'react-router';
import AppBar from 'material-ui/AppBar';

class Navbar extends React.Component {

    render() {
        return (
            <AppBar
                style={{height: "20%"}}
                title="Title"
                iconClassNameRight="muidocs-icon-navigation-expand-more"
            />
        );
    }
}

export default Navbar;