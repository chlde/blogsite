/**
 * Created by chenhaolong on 2017/3/13.
 */
import React from 'react';
import {Link} from 'react-router'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import BlogTag from './BlogTag';


class BlogThumbnail extends React.Component {

    constructor(props) {
        super(props);
        this.blogItem = this.props.blogItem ? this.props.blogItem : {};
        this.state = {
            shadow: 1,
        };
        this.blogItem.picLink = this.blogItem.picLink ? this.blogItem.picLink:
            "http://paullaros.nl/material-blog-1-1/img/travel/unsplash-2.jpg";
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    onMouseOver() {
        this.setState({shadow: 3});
    }

    onMouseOut() {
        this.setState({shadow: 1});
    }

    render() {
        return (
            <Link key={this.blogItem.blogId} to='blogDetail' params={{blogTitle: this.blogItem.blogTitle}}  style={{textDecoration: 'none', color: 'black'}}>
            <Card
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                zDepth={this.state.shadow}
                style={{width: "90%", zIndex: 100, marginBottom: 15}}>
                <CardTitle title={this.blogItem.blogName} style={{height: "30%", position: "inherit"}} />
                <BlogTag blogTags={this.blogItem.blogTags}/>
                <CardMedia style={{height: "40%", position: "inherit"}} >
                    <img src = {this.blogItem.picLink} />
                </CardMedia>
                <CardText style={{height: "30%", position: "inherit"}}>
                    {this.blogItem.blogBrief}
                </CardText>
            </Card>
            </Link>
        );
    }
}


export default BlogThumbnail;