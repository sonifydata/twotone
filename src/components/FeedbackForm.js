import React from 'react';
import { store } from '../store';
import {CloseRounded} from '@material-ui/icons';
import {IconButton} from '@material-ui/core';

import sonifyLogo from '../images/sonify-branding/sonify-logo-b-trans.png';

const encode = (data) => {
	return Object.keys(data)
		.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
		.join('&');
}

class FeedbackForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { name: '', email: '', messageText: '' , browserInfo: '', subject: ''};
	}

	handleFormClose = evt => {
		evt.stopPropagation();
		store.setState( { formOpen: false, activeDialog: ''});
		console.log( 'Form request close...' );
	}

	handleSubmit = e => {
		fetch('/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: encode({ 'form-name': 'feedbackForm', ...this.state })
		})
			.then(() => alert('Success!!'))
			.catch(error => alert(error));

		e.preventDefault();
		this.handleFormClose(e);
	};

	handleChange = e => this.setState({ [e.target.name]: e.target.value });

	render() {
		const { name, email, messageText, subject, browserInfo } = this.state;
		return <React.Fragment>

			{
				/*
					input fields:
					name
					email
					subject
					browserInfo
					messageText
				*/
			}
			<div className="container is-fluid pt-6 hero is-primary">
				<IconButton label="Close Form"
					color="inherit"
					aria-label="close form"
					style={{position: 'absolute', top: '2%', left: '95%' }}
					onClick={this.handleFormClose}><CloseRounded/></IconButton>
				<figure className="image is-16by9">
					<img className='has-ratio' width='640' alt='logo' src={sonifyLogo}/>
				</figure>
				<p className="title mb-2">Feedback Form</p>
				<p className="subtitle pb-2">〇</p>
			</div>

			<div className="container is-fluid pt-6 hero is-dark">
				<form
					name="feedbackForm"
					method="POST"
					onSubmit={this.handleSubmit} >
					<input
						name="form-name"
						value="feedbackForm"
						aria-hidden="true"
						type="hidden" />
					<div className="field">
						<label className="has-text-light">Name</label>
						<div className="control">
							<input
								name="name"
								className="input"
								type="text"
								placeholder="Your name"
								value={name} onChange={this.handleChange}/>
						</div>
					</div>

					<div className="field">
						<label className="has-text-light">Email</label>
						<div className="control has-icons-left">
							<input
								name="email"
								className="input is-primary"
								type="email"
								placeholder="Email input "
								value={email} onChange={this.handleChange}/>
						</div>
						<p className="help is-primary">Please enter a valid email address.</p>
					</div>
					<div className="field pt-4">
						<label className="has-text-light">Subject</label>
						<div className="control">
							<div className="select">
								<select
									name="subject"
									value={subject}
									onChange={this.handleChange}>
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
							<input
								name="browserInfo"
								className="input"
								type="text"
								placeholder="Browser and operating system"
								value={browserInfo} onChange={this.handleChange}/>
						</div>
					</div>

					<div className="field pt-4">
						<label className="has-text-light">Message</label>
						<div className="control">
							<textarea
								name="messageText"
								className="textarea"
								placeholder="Your message"
								value={messageText}
								onChange={this.handleChange}/>
						</div>
					</div>

					<div className="field is-grouped mb-6">
						<div className="control">
							<button className="button is-primary" aria-label="Submit" type="submit">Submit</button>
						</div>
						{/*<div className="control">*/}
						{/*	<button className="button is-primary is-light" aria-label="Done"*/}
						{/*		onClick={this.handleFormClose}>Done</button>*/}
						{/*</div>*/}
					</div>
				</form>
				<footer className='footer' id='formFooter'>
					<div className="content" style={{ textAlign: 'right' }}>
						By submitting this form you agree to the terms and conditions. Click here to visit <strong><a href="http:sonify.io">Sonify website</a></strong>
					</div>
				</footer>
			</div>
		</React.Fragment>
	}
}

export default FeedbackForm;
