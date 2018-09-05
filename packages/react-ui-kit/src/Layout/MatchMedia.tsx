import * as React from 'react';
import {defaultProps} from 'recompose';
import {QUERY} from '../mediaQueries';

interface MatchMediaProps {
  not?: boolean;
  query: string;
}

interface MatchMediaState {
  isMatching: boolean;
}

class MatchMedia extends React.PureComponent<MatchMediaProps & React.HTMLAttributes<HTMLElement>, MatchMediaState> {
  static defaultProps = {
    not: false,
  };
  matchMedia: MediaQueryList;
  constructor(props: MatchMediaProps) {
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

const IsDesktop = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.desktop})(MatchMedia);
const IsDesktopXL = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.desktopXL})(
  MatchMedia
);
const IsMobile = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.mobile})(MatchMedia);
const IsMobileUp = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.mobileUp})(
  MatchMedia
);
const IsTablet = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.tablet})(MatchMedia);
const IsTabletDown = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.tabletDown})(
  MatchMedia
);
const IsTabletUp = defaultProps<MatchMediaProps & React.HTMLAttributes<HTMLElement>>({query: QUERY.tabletUp})(
  MatchMedia
);

export {MatchMedia, IsDesktop, IsDesktopXL, IsMobile, IsMobileUp, IsTablet, IsTabletDown, IsTabletUp};
