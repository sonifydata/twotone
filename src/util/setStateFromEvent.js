const intRegex = /^[0-9]+$/;
export default component => evt => {
	const name = evt.target.name;
	const value = intRegex.test(evt.target.value) ? parseInt(evt.target.value, 10) : evt.target.value;
	component.setState({
		[name]: value
	});
};