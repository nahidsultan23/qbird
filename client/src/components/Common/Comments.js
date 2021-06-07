import React from 'react'
import Moment from 'react-moment';
import { connect } from 'react-redux';
import Rating from 'react-rating';

import { thousandSeparators } from '../../services/common';

class Comments extends React.Component {

    onSubmit = (e, commentID, type) => {
        e.preventDefault();
        if(type === "comment") {
            const value = e.target.comment.value;
            if(value && value.trim() !== "") {
                this.props.onComment(value);
                e.target.comment.value = '';
            }
        }
        else {
            const value = e.target.reply.value;
            if(value && value.trim() !== "") {
                this.props.onReply({ message: value, commentID: commentID });
                e.target.reply.value = '';
            }
        }
    }

    render() {
        const { comments, canMakeChanges } = this.props;
        const { isAuthenticated } = this.props.auth;
        return (
            <div className="comments-area">
                <div className="comments-title">{(comments && comments.length) ? thousandSeparators(comments.length) : 0} {(comments && comments.length > 1) ? 'Comments' : 'Comment'}</div>
                {isAuthenticated && canMakeChanges && <div className="comment-respond" style={{ marginBottom: '15px' }}>
                    <form className="comment-form" onSubmit={(e) => this.onSubmit(e, null, 'comment')}>
                        <p className="comment-form-comment">
                            <textarea name="comment" placeholder="Write a comment..." id="comment" cols="45" rows="3" maxLength="2000"></textarea>
                            <button className="post-comment">Post Comment</button>
                        </p>

                    </form>
                </div>}
                {comments && comments.length > 0 && comments.map(({ time, replies, commentID, userName, comment, orderID, rating, deletable }) => {
                    return (
                        <ol className="comment-list" key={commentID}>
                            <li className="comment">
                                {deletable && <span className="delete-shop-and-ad cursor-pointer float-right" onClick={() => this.props.onDeleteComment(commentID)}><i className="far fa-trash-alt"></i></span>}
                                <article className="comment-body">
                                    <footer className="comment-meta">
                                        <div className="comment-author vcard">
                                            <b className="fn">{userName}</b>
                                        </div>

                                        <div className="comment-metadata">
                                            <time><Moment fromNow>{time}</Moment></time>
                                        </div>
                                        <span>{orderID !== null && orderID !== undefined ? <Rating
                                            emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                                            fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                                            initialRating={rating}
                                            readonly={true} /> : ''}</span>
                                    </footer>

                                    <div className="comment-content">
                                        <p className="word-break whitespace-pre-wrap">{comment}</p>
                                    </div>
                                </article>
                                {replies && replies.length > 0 && replies.map((reply, index) => {
                                    return (
                                        <ol className="children" key={commentID + index}>
                                            <li className="comment">
                                                {reply.deletable && <span className="delete-shop-and-ad cursor-pointer float-right" onClick={() => this.props.onDeleteReply(commentID, reply.replyID)}><i className="far fa-trash-alt"></i></span>}
                                                <article className="comment-body">
                                                    <footer className="comment-meta">
                                                        <div className="comment-author vcard">
                                                            <b className="fn">{reply.userName}</b>
                                                        </div>

                                                        <div className="comment-metadata">
                                                            <time><Moment fromNow>{reply.time}</Moment></time>
                                                        </div>
                                                    </footer>

                                                    <div className="comment-content">
                                                        <p className="word-break whitespace-pre-wrap">{reply.reply}</p>
                                                    </div>
                                                </article>
                                            </li>
                                        </ol>
                                    )
                                })}
                                {isAuthenticated && canMakeChanges && <div className="comment-respond comment-reply">
                                    <form onSubmit={(e) => this.onSubmit(e, commentID, 'reply')}>
                                        <p className="comment-form-reply">
                                            <textarea name="reply" placeholder="Write a reply..." cols="45" rows="1" maxLength="500"></textarea>
                                            <button className="post-comment">Post Reply</button>
                                        </p>
                                    </form>
                                </div>}
                            </li>
                        </ol>
                    )
                })}
            </div>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth
    }
}

export default connect(mapStateToProps)(Comments);
