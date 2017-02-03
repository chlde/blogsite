/**
 * Created by chenhaolong on 2017/1/5.
 */
import React from 'react';
import {Link} from 'react-router';
import FooterStore from '../stores/FooterStore'
import FooterActions from '../actions/FooterActions';

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = FooterStore.getState();
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        FooterStore.listen(this.onChange);
        FooterActions.getBlogList();
    }

    componentWillUnmount() {
        FooterStore.unlisten(this.onChange);
    }

    onChange(state) {
        this.setState(state);
    }

    render() {
        let blogListContent;
        if (this.state.blogList && this.state.blogList.length > 0) {
            blogListContent = this.state.blogList.map((blog) => {
                return (
                    <li key={blog.blogId}>
                        {blog.blogName}
                    </li>
                )
            });
        } else {
            blogListContent = (<li>无内容展示</li>);
        }

        return (
            <footer>
                <div className='container'>
                    <div className='row'>
                        <div className='col-sm-5'>
                            <h3 className='lead'><strong>Information</strong> and <strong>Copyright</strong></h3>
                            <p>Powered by <strong>Node.js</strong>, <strong>MongoDB</strong> and <strong>React</strong> with Flux architecture and server-side rendering.</p>
                            <p>You may view the <a href='https://github.com/sahat/newedenfaces-react'>Source Code</a> behind this project on GitHub.</p>
                            <p>© 2015 Sahat Yalkabov.</p>
                        </div>
                        <div className='col-sm-7 hidden-xs'>
                            <h3 className='lead'><strong>Leaderboard</strong> Top 5 Characters</h3>
                            <ul className='list-inline'>
                                {blogListContent}
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
