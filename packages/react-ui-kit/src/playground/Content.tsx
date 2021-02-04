import React from 'react';
import {Box, Column, Columns, FlexBox} from '../Layout';
import {QueryKeys} from '../mediaQueries';
import {H2, Line} from '../Text';

interface Props {}

const Content: React.FC<Props> = ({}) => {
  const lorem =
    'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        padding: '16px',
        borderRight: '1px solid lightgray',
        borderLeft: '1px solid lightgray',
      }}
    >
      <H2>Columns (+ media query)</H2>
      <Line style={{marginTop: '0'}} />
      <Columns query={QueryKeys.TABLET_DOWN}>
        <Column>
          <Box>{lorem}</Box>
        </Column>
        <Column>
          <Box>{lorem}</Box>
        </Column>
        <Column>
          <Box>{lorem}</Box>
        </Column>
      </Columns>
      <H2>Flex wrap</H2>
      <Line style={{marginTop: '0'}} />
      <FlexBox flexWrap={'wrap'} style={{gap: '16px'}}>
        <Box style={{maxWidth: '300px'}}>{lorem}</Box>
        <Box style={{maxWidth: '300px'}}>{lorem}</Box>
        <Box style={{maxWidth: '300px'}}>{lorem}</Box>
      </FlexBox>
    </div>
  );
};

export default Content;
