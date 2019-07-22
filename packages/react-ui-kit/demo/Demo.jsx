/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {
  Avatar,
  COLOR,
  Container,
  ContainerXS,
  Content,
  Footer,
  H1,
  HeaderMenu,
  HeaderSubMenu,
  Line,
  Loading,
  Logo,
  MenuLink,
  Pagination,
  Pill,
  PILL_TYPE,
  QUERY,
  Small,
  StyledApp,
  Tooltip,
} from '@wireapp/react-ui-kit';
import React, {useState} from 'react';
import Helmet from 'react-helmet';

import {avatarBase64} from './avatarImage';
import {DemoAnimations} from './DemoAnimations';
import {DemoColors} from './DemoColors';
import {DemoIcons} from './DemoIcons';
import {DemoInputs} from './DemoInputs';
import {DemoLayouts} from './DemoLayouts';
import {DemoModals} from './DemoModals';
import {DemoTypography} from './DemoTypography';

const Demo = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showFirstDropdown, setShowFirstDropdown] = useState(false);
  const [showSecondDropdown, setShowSecondDropdown] = useState(false);
  const paginatedList = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18]]; // eslint-disable-line no-magic-numbers
  const isDesktop = typeof window !== 'undefined' && window.matchMedia(`(${QUERY.desktop})`).matches;

  return (
    <StyledApp>
      <Helmet
        meta={[
          {
            content: 'width=device-width, initial-scale=1, user-scalable=no',
            name: 'viewport',
          },
        ]}
      />
      <HeaderMenu logoElement={<Logo width={72} />}>
        <MenuLink href="#" color={COLOR.GREEN} button>
          test1
        </MenuLink>
        <MenuLink href="#">test1</MenuLink>
        <MenuLink href="#">test2</MenuLink>
        <HeaderSubMenu
          caption={'Drowdown1'}
          isOpen={showFirstDropdown}
          onMouseLeave={isDesktop ? () => setShowFirstDropdown(false) : undefined}
          onMouseOver={() => {
            if (isDesktop) {
              setShowFirstDropdown(true);
              setShowSecondDropdown(false);
            }
          }}
          onClick={event => {
            event.stopPropagation();
            setShowFirstDropdown(!showFirstDropdown);
            setShowSecondDropdown(false);
          }}
        >
          <MenuLink noWrap>{'Messaging1'}</MenuLink>
          <MenuLink noWrap>{'Voice & video1'}</MenuLink>
          <MenuLink noWrap>{'File sharing & productivity1'}</MenuLink>
        </HeaderSubMenu>
        <HeaderSubMenu
          caption={'Drowdown2'}
          isOpen={showSecondDropdown}
          onMouseLeave={isDesktop ? () => setShowSecondDropdown(false) : undefined}
          onMouseOver={() => {
            if (isDesktop) {
              setShowFirstDropdown(false);
              setShowSecondDropdown(true);
            }
          }}
          onClick={event => {
            event.stopPropagation();
            setShowFirstDropdown(false);
            setShowSecondDropdown(!showSecondDropdown);
          }}
        >
          <MenuLink noWrap>{'Messaging2'}</MenuLink>
          <MenuLink noWrap>{'Voice & video2'}</MenuLink>
          <MenuLink noWrap>{'File sharing & productivity2'}</MenuLink>
        </HeaderSubMenu>
        <MenuLink href="#">test3</MenuLink>
        <MenuLink href="#">test4</MenuLink>
        <MenuLink href="#">test5</MenuLink>
      </HeaderMenu>

      <Content>
        <Container style={{alignItems: 'center', display: 'flex', justifyContent: 'space-around'}}>
          <Tooltip light right text="This is our logo with a whole bunch of text in here">
            <Logo scale={3} color={COLOR.BLUE} />
          </Tooltip>
          <Tooltip left text="This is our logo with a whole bunch of text in here">
            <Loading />
          </Tooltip>
          <Tooltip bottom text="This is our logo with a whole bunch of text in here">
            <Loading progress={0.33} />
          </Tooltip>
          <Tooltip text="This is our logo with a whole bunch of text in here">
            <Loading progress={0.66} size={100} />
          </Tooltip>
        </Container>
        <Container>
          <H1>Pagination</H1>
          <ContainerXS>
            {paginatedList[currentPage].map(item => (
              <Small key={item} center bold block style={{border: `1px solid ${COLOR.GRAY}`, margin: 10}}>
                {`- ${item}`}
              </Small>
            ))}
            <Pagination
              currentPage={currentPage}
              goPage={setCurrentPage}
              nextPageComponent={() => 'Next'}
              numberOfPages={paginatedList.length}
              previousPageComponent={() => 'Previous'}
            />
          </ContainerXS>
        </Container>
        <Container>
          <H1>Pills</H1>
          <Pill>Default Pill</Pill>
          <Pill active>Active default Pill</Pill>
          <Pill type={PILL_TYPE.error}>Error Pill</Pill>
          <Pill type={PILL_TYPE.success}>Success Pill</Pill>
          <Pill type={PILL_TYPE.warning}>Warning Pill</Pill>
        </Container>
        <Container>
          <Line />
          <H1>Avatars</H1>
          <div
            style={{
              alignItems: 'center',
              display: 'grid',
              gridGap: 16,
              gridTemplateColumns: 'repeat(6, 1fr)',
              justifyItems: 'center',
            }}
          >
            <Avatar
              size={120}
              fontSize={20}
              name={'Joe Do'}
              forceInitials={false}
              base64Image={avatarBase64}
              borderColor={'#fb0807'}
              backgroundColor={'#2085C2'}
            />
            <Avatar
              size={120}
              fontSize={20}
              name={'Jon Bon Jovi'}
              forceInitials={true}
              borderColor={'#fb0807'}
              backgroundColor={'#2085C2'}
              fetchImage={() => {
                console.info('Trying to fetch asset');
              }}
            />
            <Avatar
              size={64}
              fontSize={20}
              name={'Joe Do'}
              forceInitials={false}
              base64Image={avatarBase64}
              borderColor={'#fb0807'}
              backgroundColor={'#2085C2'}
            />
            <Avatar size={64} fontSize={20} name={'Joe Do'} backgroundColor={'#2085C2'} />
            <Avatar size={32} fontSize={20} name={'Joe Do'} borderColor={'#fb0807'} backgroundColor={'#2085C2'} />
            <Avatar size={24} fontSize={20} name={'Joe Do'} borderColor={'#fb0807'} backgroundColor={'#2085C2'} />
          </div>
        </Container>
        <DemoIcons />
        <DemoLayouts />
        <DemoInputs />
        <DemoModals />
        <DemoTypography />
        <DemoAnimations />
        <DemoColors />
      </Content>
      <Footer>Footer</Footer>
    </StyledApp>
  );
};

Demo.displayName = 'Demo';

// eslint-disable-next-line import/no-default-export
export default Demo;
