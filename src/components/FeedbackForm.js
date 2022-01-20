import React from 'react';
import { store } from '../store';
import {CloseRounded} from "@material-ui/icons";
import {IconButton} from "@material-ui/core";

const encode = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
}

class FeedbackForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { name: "", email: "", messageText: "" , browserInfo: "", subject: ""};
    }

    /* Here’s the juicy bit for posting the form submission */
     handleFormClose = evt => {
        evt.stopPropagation();
        store.setState( { formOpen: false, activeDialog: ''});
        console.log( 'Form request close...' );
    }

    handleSubmit = e => {
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encode({ "form-name": "contact", ...this.state })
        })
            .then(() => alert("Success!!"))
            .catch(error => alert(error));

        e.preventDefault();
    };

    handleChange = e => this.setState({ [e.target.name]: e.target.value });

    render() {
        const { name, email, messageText, subject, browserInfo } = this.state;
        return <React.Fragment>

            <div className="container is-fluid pt-6 hero is-primary">
                <IconButton label="Close Form"
                            color="inherit"
                            aria-label="close form"
                            style={{position: 'absolute', top: '2%', left: '95%' }}
                            onClick={this.handleFormClose}><CloseRounded/></IconButton>
                <figure className="image is-16by9">
                <img className='has-ratio' width='640'
                    src="data:image/png;base64,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"
                    alt='logo image'/>
                </figure>
                <p className="title mb-2">Feedback Form</p>
                <p className="subtitle pb-2">〇</p>
            </div>

            <div className="container is-fluid pt-6 hero is-dark">
                <form name="feedbackForm" data-netlify="true" netlify-honeypot="bot-field"  method="POST" onSubmit={this.handleSubmit} >
                    <input aria-hidden="true" type="hidden" name="form-name" value="feedbackForm" />
                    <div className="field">
                        <label className="has-text-light">Name</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="Your name" name="name" value={name} onChange={this.handleChange}/>
                        </div>
                    </div>

                    <div className="field">
                        <label className="has-text-light">Email</label>
                        <div className="control has-icons-left">
                            <input className="input is-primary" type="email" placeholder="Email input " name="email" value={email} onChange={this.handleChange}/>
                        </div>
                        <p className="help is-primary">Please enter a valid email address.</p>
                    </div>


                    <div className="field pt-4">
                        <label className="has-text-light">Subject</label>
                        <div className="control">
                            <div className="select">
                                <select name="subject" value={subject} onChange={this.handleChange}>
                                    <option>Beta Testing</option>
                                    <option>Bug report</option>
                                    <option>Feature request</option>
                                    <option>General</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label className="has-text-light">Technical Information</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="Browser and operating system" name="browserInfo" value={browserInfo} onChange={this.handleChange}/>
                        </div>
                    </div>

                    <div className="field pt-4">
                        <label className="has-text-light">Message</label>
                        <div className="control">
                            <textarea className="textarea" placeholder="Your message" name="messageText" value={messageText} onChange={this.handleChange}/>
                        </div>
                    </div>

                    <div className="field is-grouped mb-6">
                        <div className="control">
                            <button className="button is-primary" aria-label="Submit" type="submit">Submit</button>
                        </div>
                        <div className="control">
                            <button className="button is-primary is-light" aria-label="Done"
                                    onClick={this.handleFormClose}>Done</button>
                        </div>
                    </div>
                </form>
                <footer className="footer">
                    <div className="has-text-centered">
                        <p>
                            By submitting this form you agree to the terms and conditions. Click here to visit <strong><a href="http:sonify.io">Sonify website</a></strong>
                        </p>
                    </div>
                </footer>
            </div>

        </React.Fragment>
    }
}

export default FeedbackForm;
