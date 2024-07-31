Demo:

```js
import {Fragment} from 'react';
import {Form, Tooltip, Input, Button} from '@wireapp/react-ui-kit';

<Fragment>
  <Form
    style={{display: 'flex', flexDireciton: 'column', margin: '0 auto'}}
    onSubmit={event => {
      event.preventDefault();
    }}
  >
    <div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Tooltip
          body="This is NOT WIRE but an internal testing environment. Authorized for use by Wire employees only. Any public USE is PROHIBITED. The data of the users of this test environment is extensively recorded and analysed. To use the secure messenger Wire, please visit "
          selector="#rsg-root"
        >
          <Button>
            Tooltip on top
          </Button>
        </Tooltip>
      </div>

      <div style={{marginTop: '100px'}}>
        <Tooltip
          body="test tooltip"
          selector="#rsg-root"
        >
          <Button>
            Tooltip on top
          </Button>
        </Tooltip>
      </div>

      <div style={{position: 'absolute', left: '0', zIndex: '9999'}}>
        <div style={{padding: '0 30px'}}>
          <Tooltip
            body="This is NOT WIRE but an internal testing environment. Authorized for use by Wire employees only. Any public USE is PROHIBITED. The data of the users of this test environment is extensively recorded and analysed. To use the secure messenger Wire, please visit "
            selector="#rsg-root"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="css-14d5nx7-ConversationTabs"><path id="a" d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm0-2A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm0-7c.6 0 1 .4 1 1v3a1 1 0 0 1-2 0V8c0-.6.4-1 1-1zm0-1a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>
          </Tooltip>
        </div>
      </div>

      <div style={{position: 'absolute', right: '0',  paddingRight: '30px', zIndex: '9999'}}>
        <Tooltip
          body="This is NOT WIRE but an internal testing environment. Authorized for use by Wire employees only. Any public USE is PROHIBITED. The data of the users of this test environment is extensively recorded and analysed. To use the secure messenger Wire, please visit [link]{{url}}[/link]"
          selector="#rsg-root"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" data-uie-name="proteus-user-verified" class="css-mmuuu1-SVGIcon"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1.87197V8C15 12 12.0344 15.0977 8 16C4.00718 15.0977 1 12 1 8V2L8 0L15 1.87197Z" fill="#0552A0"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C4.00718 15.0977 1 12 1 8V2L8 0C8 0 8 13 8 16Z" fill="#6AA4DE"></path></g></svg>
        </Tooltip>
      </div>
    </div>

    <p>If You want to test tooltip bottom scroll this button to top of the page :)</p>
  </Form>
</Fragment>;
```
