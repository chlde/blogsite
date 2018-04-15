import React from 'react';
import Headroom from 'react-headroom/dist/index';
import Divider from 'material-ui/Divider';
import BlogActions from '../actions/BlogActions';
import BlogStore from '../stores/BlogStore';
import Navbar from './Navbar';
import BlogTag from './BlogTag';
import BlogMessageBoard from './BlogMessageBoard';
import BlogAnchor from './BlogAnchor';
import { StickyContainer, Sticky } from 'react-sticky';
const showdownHighlight = require("showdown-highlight");


class BlogDetail extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.params.blogTitle) {
            BlogActions.getBlogByTitle(this.props.params.blogTitle);
        } else {
            console.log('blog id not found');
        }
        this.onChange = this.onChange.bind(this);
        if (articleInstance) {
            this.state = {
                blogInfo: {
                    blogId: 999999,
                    blogTitle: articleInstance.title,
                    blogContent: articleInstance.content
                }
            };
        } else {
            this.state = {
                blogInfo: {}
            };
        }

        this.converter =  new showdown.Converter({
            extensions: [showdownHighlight]
        });
    }

    componentDidMount() {
        BlogStore.listen(this.onChange);
        $('#Circular')
            .hide()  // Hide it initially
            .ajaxStart(function() {
                $(this).show();
            })
            .ajaxStop(function() {
                $(this).hide();
            })
        ;
    }

    componentWillUnmount() {
        BlogStore.unlisten(this.onChange);
        $('#Circular').off();
    }

    onChange(state) {
        this.setState(state);
    }

    render() {
        let backgroundUrl = this.state.blogInfo.blogBackground ? this.state.blogInfo.blogBackground:
            'http://localhost:3001/blog/1489648251510';
        let styleInfo = {
            backgroundImage: 'url("' + backgroundUrl + '")',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backgroundRepeat: 'inherit',
            backgroundAttachment: 'fixed',
            zIndex: 1,
        };
        let headerStyle = {
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            verticalAlign: 'baseline',
            background: '0 0',
            fontSize: 40,
            // color: '#79829a',
            color: 'black',
            textAlign: "center"
        };
        let contentStyle = {
            // color: '#79829a'
            color: 'black'
        };

        const rawHtml = this.converter.makeHtml(this.state.blogInfo.blogMarkdownContent);

        return (
            <div>
                <Headroom
                    onPin={() => console.log('pinned')}
                    onUnpin={() => console.log('unpinned')}
                    style={{
                        boxShadow: '1px 1px 1px rgba(0,0,0,0.25)',
                        background: 'rgb(57, 111, 176)',
                        zIndex: 999
                    }}
                >
                    <Navbar type='light' />
                </Headroom>
                <StickyContainer>
                    <div style={{
                            position: "absolute",
                            height: "0",
                            width: "260px",
                            marginTop: "1em",
                            marginRight: "2em",
                            right: 0,
                            zIndex: 997
                         }}>

                            <Sticky disableCompensation
                                    topOffset={80}>
                                <BlogAnchor blogInfo={this.state.blogInfo}/>
                            </Sticky>

                    </div>
                    {
                        this.state.blogInfo && this.state.blogInfo.blogId ?
                            <div style={styleInfo}>
                                <div style={{
                                    backgroundColor: 'rgba(211, 237, 208, 0.8)',
                                    }}>
                                <article className="container" style={{
                                    height: '100%',
                                    paddingTop: '50px',
                                    position: 'relative',
                                    // fontSize: 18,
                                    zIndex: 996
                                }}>
                                    <div style={headerStyle}><h1>{this.state.blogInfo.blogName}</h1></div>
                                    <BlogTag blogTags={this.state.blogInfo && this.state.blogInfo.blogTags ?
                                        this.state.blogInfo.blogTags: []} />
                                    <Divider style={{
                                        backgroundColor: '#2b2b2b',
                                        marginTop: 15
                                    }}/>
                                    <div style={contentStyle}
                                         dangerouslySetInnerHTML={{__html: rawHtml}}></div>
                                    <Divider style={{
                                        backgroundColor: '#2b2b2b',
                                        marginTop: 15
                                    }}/>
                                    <div className="container">
                                        <BlogMessageBoard blogId={this.state.blogInfo.blogId} />
                                    </div>
                                </article>
                                </div>
                            </div>
                            :
                            <div style={{padding: 10}}>未找到当前博客内容</div>
                    }
                </StickyContainer>
            </div>
        );
    }
}

export default BlogDetail;