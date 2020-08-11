import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Mask from './Mask';
import MaskChild from './MaskChild';
import Icon from './Icon';

export default class Modal extends React.PureComponent {
  static propTypes = {
    sm:        PropTypes.bool,
    md:        PropTypes.bool,
    lg:        PropTypes.bool,
    title:     PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    open:      PropTypes.bool,
    black:     PropTypes.bool,
    className: PropTypes.string,
    children:  PropTypes.node,
    onVisible: PropTypes.func,
    onHidden:  PropTypes.func
  };

  static defaultProps = {
    sm:        false,
    md:        false,
    lg:        false,
    title:     '',
    open:      false,
    black:     false,
    className: '',
    children:  '',
    onVisible: () => {
    },
    onHidden:  () => {
    }
  };

  /**
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.scrollbars = React.createRef();
    this.state = {
      open:    props.open,
      visible: false
    };
  }

  /**
   * @param {*} prevProps
   */
  componentDidUpdate(prevProps) {
    const { open } = this.props;
    const { open: pOpen } = prevProps;

    if (open && !pOpen) {
      this.setState({ open: true });
    }
  }

  /**
   *
   */
  scroll = (left, top = 0) => {
    this.scrollbars.current.view.scroll({
      top,
      left,
      behavior: 'smooth'
    });
  };

  /**
   *
   */
  handleMaskClick = () => {
    this.setState({ open: false });
  };

  /**
   * @param {Event} e
   */
  handleMaskVisible = (e) => {
    const { onVisible } = this.props;

    this.setState({ visible: true });
    onVisible(e);
  };

  /**
   * @param {Event} e
   */
  handleClick = (e) => {
    e.stopPropagation();
  };

  /**
   * @returns {*}
   */
  render() {
    const { sm, md, lg, title, black, onHidden, className, children } = this.props;
    const { open, visible } = this.state;

    const classes = classNames('rp-modal', {
      'rp-modal-sm':     sm,
      'rp-modal-lg':     lg,
      'rp-modal-md':     md,
      'rp-modal-narrow': (!lg && !sm && !md),
      visible
    }, className);

    return (
      <Mask
        open={open}
        black={black}
        onHidden={onHidden}
        onVisible={this.handleMaskVisible}
        onClick={this.handleMaskClick}
      >
        <MaskChild>
          <div
            role="dialog"
            className={classes}
            onClick={this.handleClick}
            onMouseDown={this.handleClick}
          >
            {title && (
              <div className="rp-modal-header">
                <Icon
                  name="times"
                  title="Close"
                  onClick={this.handleMaskClick}
                />
                <span>{title}</span>
              </div>
            )}
            <div className="rp-modal-inner">
              <div className="rp-modal-body">
                {children}
              </div>
            </div>
          </div>
        </MaskChild>
      </Mask>
    );
  }
}
