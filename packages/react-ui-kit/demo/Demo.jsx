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
  PILL_TYPE,
  Pagination,
  Pill,
  QUERY,
  Small,
  StyledApp,
  Tooltip,
} from '@wireapp/react-ui-kit';
import {DemoAnimations} from './DemoAnimations';
import {DemoColors} from './DemoColors';
import {DemoIcons} from './DemoIcons';
import {DemoInputs} from './DemoInputs';
import {DemoLayouts} from './DemoLayouts';
import {DemoModals} from './DemoModals';
import {DemoTypography} from './DemoTypography';
import Helmet from 'react-helmet';
import React from 'react';

class Demo extends React.PureComponent {
  state = {
    currentPage: 0,
    showFirstDropdown: false,
    showSecondDropdown: false,
  };

  goPage = index => this.setState(state => ({currentPage: index}));

  render() {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia(`(${QUERY.desktop})`).matches;
    const paginatedList = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18]]; // eslint-disable-line no-magic-numbers

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
            isOpen={this.state.showFirstDropdown}
            onMouseLeave={isDesktop ? () => this.setState({showFirstDropdown: false}) : undefined}
            onMouseOver={
              isDesktop ? () => this.setState({showFirstDropdown: true, showSecondDropdown: false}) : undefined
            }
            onClick={event => {
              event.stopPropagation();
              this.setState({showFirstDropdown: !this.state.showFirstDropdown, showSecondDropdown: false});
            }}
          >
            <MenuLink noWrap>{'Messaging1'}</MenuLink>
            <MenuLink noWrap>{'Voice & video1'}</MenuLink>
            <MenuLink noWrap>{'File sharing & productivity1'}</MenuLink>
          </HeaderSubMenu>
          <HeaderSubMenu
            caption={'Drowdown2'}
            isOpen={this.state.showSecondDropdown}
            onMouseLeave={isDesktop ? () => this.setState({showSecondDropdown: false}) : undefined}
            onMouseOver={
              isDesktop ? () => this.setState({showFirstDropdown: false, showSecondDropdown: true}) : undefined
            }
            onClick={event => {
              event.stopPropagation();
              this.setState({showFirstDropdown: false, showSecondDropdown: !this.state.showSecondDropdown});
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
              {paginatedList[this.state.currentPage].map(item => (
                <Small key={item} center bold block style={{border: `1px solid ${COLOR.GRAY}`, margin: 10}}>
                  {`- ${item}`}
                </Small>
              ))}
              <Pagination
                currentPage={this.state.currentPage}
                goPage={this.goPage}
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
                base64Image={
                  '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'
                }
                borderColor={'#fb0807'}
                backgroundColor={'#2085C2'}
              />
              <Avatar
                size={120}
                fontSize={20}
                name={'Joe Do'}
                forceInitials={true}
                borderColor={'#fb0807'}
                backgroundColor={'#2085C2'}
              />
              <Avatar
                size={64}
                fontSize={20}
                name={'Joe Do'}
                forceInitials={false}
                base64Image={
                  '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'
                }
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
  }
}

export {Demo};
