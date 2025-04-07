# API

You can generate files using jatg through its programming interface.

Feel free to use it to build a code generator CLI for your own framework.

Simply import the library and use the function to generate a template. Here's an example:

```ts
import { processTemplates } from 'jatg';
import { join } from 'node:path';

await processTemplates(
  // Templates configs
  [
    {
      name: 'Sample Template',
      sourcePaths: [
        join(__dirname, '../my-template'),
      ],
      outputPath: './src',
      variables: [
        {
          name: 'Endpoint Path',
          variable: 'endpointPath',
        }
      ]
    }
  ],
  // Variable values
  new Map([
    ['endpointPath', '/users'],
  ]),
);
```
