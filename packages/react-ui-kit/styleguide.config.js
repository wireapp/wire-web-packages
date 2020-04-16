/* eslint-disable sort-keys-fix/sort-keys-fix */
const fs = require('fs');
const path = require('path');
const docgen = require('react-docgen');
const packageJson = require('./package.json');

function resolve(...paths) {
  return fs.realpathSync(path.join(__dirname, ...paths));
}

module.exports = {
  title: `Wireapp React Ui Kit v${packageJson.version}`,
  // components: 'src/**/*.tsx',
  // ignore: ['src/**/*.test.tsx', 'src/Form/Form.tsx'],
  sections: [
    {
      name: 'Forms',
      components: 'src/Form/**/*.tsx',
      ignore: [
        'src/Form/Input.tsx',
        'src/Form/ShakeBox.tsx',
        'src/Form/InputBlock.tsx',
        'src/Form/InputBlock.tsx',
        'src/Form/RoundIconButton.tsx',
        'src/Form/InputSubmitCombo.tsx',
      ],
    },
    // {name: 'Layout', components: 'src/Layout/**/*.tsx'},
    {name: 'Identity', components: 'src/Identity/**/*.tsx'},
    {name: 'Menu', components: 'src/Menu/**/*.tsx', ignore: ['src/Menu/MenuModal.tsx']},
    {name: 'Modal', components: 'src/Modal/**/*.tsx', ignore: ['src/Modal/Overlay.tsx']},
    {name: 'Misc', components: 'src/Misc/**/*.tsx', ignore: ['src/Misc/IsInViewport.tsx']},
    {name: 'Typography', components: 'src/Text/**/*.tsx'},
    {
      name: 'Icons',
      components: 'src/Icon/SVGIcon.tsx',
    },
    {
      name: 'Colors',
      content: 'src/Identity/colors.md',
    },
  ],
  styleguideComponents: {
    Wrapper: resolve('styleguide/wrapper.js'),
  },
  resolver: docgen.resolver.findAllExportedComponentDefinitions,
  styles: {
    Playground: {
      preview: {
        backgroundColor: '#f7f8fa',
      },
    },
  },
  usageMode: 'expand',
};
