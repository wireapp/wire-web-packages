import React from 'react';
import {StyledApp, THEME_ID} from '@wireapp/react-ui-kit';

function Wrapper(props) {
  return (
    <div>
      <StyledApp themeId={THEME_ID.LIGHT}>
        <div style={{padding: 16}}>{props.children}</div>
      </StyledApp>
    </div>
  );
}

export default Wrapper;
