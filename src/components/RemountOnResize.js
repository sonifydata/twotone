import React from 'react';
import debounce from 'debounce';
import PropTypes from 'prop-types';

/*
Borrowed from
https://gist.github.com/JobLeonard/987731e86b473d42cd1885e70eed616a
*/
const Def = class RemountOnResize extends React.Component {
	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		])
	}

	state = {
		resizing: true
	}

	resize = () => {
		this.setState({ resizing: true });
	}

	// Because the resize event can fire very often, we
	// add a debouncer to minimise pointless
	// (unmount, resize, remount)-ing of the child nodes.
	setResize = debounce(this.resize, 500)

	componentDidMount() {
		window.addEventListener('resize', this.setResize);
		this.setState({ resizing: false });
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.setResize);
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.resizing && this.state.resizing) {
			this.setState({ resizing: false });
		}
	}

	render() {
		return this.state.resizing ? null : this.props.children;
	}
};

const RemountOnResize = Def;
export default RemountOnResize;
