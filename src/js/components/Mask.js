import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class Mask extends React.PureComponent {
  static propTypes = {
    open:      PropTypes.bool,
    black:     PropTypes.bool,
    children:  PropTypes.node,
    onClick:   PropTypes.func,
    onVisible: PropTypes.func,
    onHidden:  PropTypes.func
  };

  static defaultProps = {
    open:      false,
    black:     false,
    children:  '',
    onClick:   () => {},
    onVisible: () => {},
    onHidden:  () => {}
  };

  state = {
    visible:      false,
    childVisible: false
  };

  /**
   *
   */
  componentDidMount() {
    const { open } = this.props;

    if (open) {
      this.open();
    }
  }

  /**
   * @param {*} prevProps
   */
  componentDidUpdate(prevProps) {
    const { open } = this.props;
    const { open: pOpen } = prevProps;

    if (open && !pOpen) {
      this.open();
    } else if (!open && pOpen) {
      this.close();
    }
  }

  /**
   *
   */
  open = () => {
    const { onVisible } = this.props;

    setTimeout(() => {
      this.setState({ visible: true }, () => {
        setTimeout(() => {
          this.setState({ childVisible: true });
          onVisible();
        }, 250);
      });
    }, 250);
  };

  /**
   *
   */
  close = () => {
    const { onHidden } = this.props;

    this.setState({
      visible:      false,
      childVisible: false
    });
    onHidden();
  };

  /**
   * @param {Event} e
   */
  handleClick = (e) => {
    const { onClick } = this.props;

    e.preventDefault();
    onClick(e);
  };

  /**
   * @returns {*}
   */
  render() {
    const { children, black, open } = this.props;
    const { visible, childVisible } = this.state;

    const classes = classNames('mask', {
      mounted: open,
      visible,
      black
    });

    return ReactDOM.createPortal(
      <div
        className={classes}
        onMouseDown={this.handleClick}
        onMouseMove={e => e.stopPropagation()}
      >
        {open && React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            ...child.props,
            visible: childVisible
          });
        })}
      </div>,
      document.body
    );
  }
}
