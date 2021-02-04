import {StyledApp} from '@wireapp/react-ui-kit';
import React from 'react';
import {FlexBox, useMatchMedia} from '../Layout';
import {QUERY, QueryKeys} from '../mediaQueries';
import Content from './Content';
import Header from './Header';
import Sidebar from './Sidebar';

interface Props {}

const Root: React.FC<Props> = ({}) => {
  const isMobile = useMatchMedia(QUERY[QueryKeys.TABLET_DOWN]);
  return (
    <StyledApp>
      <Header />
      <FlexBox>
        <Sidebar isMobile={isMobile} />
        <Content />
      </FlexBox>
    </StyledApp>
  );
};

export default Root;
