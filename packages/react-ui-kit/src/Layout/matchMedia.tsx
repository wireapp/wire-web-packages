import * as React from 'react';
import {defaultProps} from 'recompose';
import {QUERY} from '../mediaQueries';

interface MatchMediaProps {
  children: Node;
  not?: boolean;
  query: string;
}

class MatchMedia extends React.PureComponent<MatchMediaProps> {
  defaultProps: MatchMediaProps = {
    not: false,
  };
  matchMedia: MediaQueryList;
  state: {
    isMatching: boolean;
  };

  constructor(props) {
    super(props);
    this.matchMedia = window.matchMedia(`(${props.query})`);
    this.state = {
      isMatching: this.matchMedia.matches,
    };
  }

  updateState = () => this.setState({isMatching: this.matchMedia.matches});
  componentDidMount() {
    this.matchMedia.addListener(this.updateState);
  }
  componentWillUnmount() {
    this.matchMedia.removeListener(this.updateState);
  }
  render() {
    const isMatching = this.props.not ? !this.state.isMatching : this.state.isMatching;
    return isMatching ? this.props.children : null;
  }
}

const IsDesktop = defaultProps({query: QUERY.desktop})(MatchMedia);
const IsDesktopXL = defaultProps({query: QUERY.desktopXL})(MatchMedia);
const IsMobile = defaultProps({query: QUERY.mobile})(MatchMedia);
const IsMobileUp = defaultProps({query: QUERY.mobileUp})(MatchMedia);
const IsTablet = defaultProps({query: QUERY.tablet})(MatchMedia);
const IsTabletDown = defaultProps({query: QUERY.tabletDown})(MatchMedia);
const IsTabletUp = defaultProps({query: QUERY.tabletUp})(MatchMedia);

export {MatchMedia, IsDesktop, IsDesktopXL, IsMobile, IsMobileUp, IsTablet, IsTabletDown, IsTabletUp};
