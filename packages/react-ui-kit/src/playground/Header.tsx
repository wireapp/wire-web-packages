import React from 'react';
import {ButtonLink} from '../Form';
import {MessageIcon} from '../Icon';
import {Avatar, COLOR, Logo} from '../Identity';
import {FlexBox} from '../Layout';
import {Link} from '../Text';

interface Props {}

const Header: React.FC<Props> = ({}) => {
  return (
    <FlexBox align="center" justify="space-between" style={{height: '50px', borderBottom: '1px solid lightgray'}}>
      <Logo style={{margin: '16px'}} />
      <FlexBox align="center" style={{height: '50px'}}>
        <span style={{marginRight: '8px'}}>
          <Avatar />
        </span>
        <Link style={{marginRight: '16px'}}>Your Name</Link>
        <ButtonLink
          backgroundColor={COLOR.BLACK}
          color={COLOR.WHITE}
          style={{
            borderRadius: '4px',
            color: COLOR.WHITE,
            fontSize: '11px',
            height: '26px',
            lineHeight: '20px',
            margin: '16px 16px 16px 16px',
            minWidth: '100px',
            padding: '0 16px',
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          <FlexBox justify="center" align="center" style={{margin: 'auto'}}>
            <div style={{margin: '5px 8px auto 0'}}>
              <MessageIcon scale={0.8} color={COLOR.WHITE} />
            </div>
            {'Open'}
          </FlexBox>
        </ButtonLink>
      </FlexBox>
    </FlexBox>
  );
};

export default Header;
