import React from 'react';
import {AddPeopleIcon, AttachmentIcon, InfoIcon, PeopleIcon, SettingsIcon} from '../Icon';
import {COLOR} from '../Identity';
import {ContainerXXS, FlexBox} from '../Layout';
import {H3, Line} from '../Text';

interface SidebarMenuItemProps {
  isMobile?: boolean;
  Icon: any;
}
const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({isMobile, Icon, children}) => {
  return (
    <FlexBox align="center">
      <Icon style={{margin: isMobile ? '16px' : undefined}} />
      {!isMobile && <H3 style={{margin: '8px'}}>{children}</H3>}
    </FlexBox>
  );
};

interface SidebarProps {
  isMobile?: boolean;
}
const Sidebar: React.FC<SidebarProps> = ({isMobile}) => {
  return (
    <FlexBox
      column
      align="center"
      style={{
        maxWidth: isMobile ? '50px' : '320px',
        minWidth: isMobile ? '50px' : '320px',
        padding: '40px',
        margin: 0,
      }}
    >
      <div
        style={{
          padding: isMobile ? undefined : '16px',
          margin: isMobile ? undefined : 'auto',
          width: isMobile ? '36px' : '60px',
          height: isMobile ? '36px' : '60px',
          backgroundColor: COLOR.GRAY,
          borderRadius: '8px',
        }}
      />
      {!isMobile && <div style={{padding: '16px', textAlign: isMobile ? undefined : 'center'}}>Team Name</div>}

      <Line style={{marginTop: '0'}} />
      <FlexBox column>
        <SidebarMenuItem isMobile={isMobile} Icon={InfoIcon}>
          {'Overview'}
        </SidebarMenuItem>
        <SidebarMenuItem isMobile={isMobile} Icon={AddPeopleIcon}>
          {'Invite People'}
        </SidebarMenuItem>
        <SidebarMenuItem isMobile={isMobile} Icon={PeopleIcon}>
          {'Manage team'}
        </SidebarMenuItem>
        <SidebarMenuItem isMobile={isMobile} Icon={SettingsIcon}>
          {'Settings'}
        </SidebarMenuItem>
        <SidebarMenuItem isMobile={isMobile} Icon={AttachmentIcon}>
          {'Billing'}
        </SidebarMenuItem>
      </FlexBox>
    </FlexBox>
  );
};

export default Sidebar;
