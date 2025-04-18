# jatg - just another template generator

[![NPM](https://img.shields.io/npm/v/jatg)](https://www.npmjs.com/package/jatg) [![Coverage](https://img.shields.io/codecov/c/github/Guichaguri/jatg?token=2LFLM6SLKP)](https://codecov.io/github/Guichaguri/jatg)

jatg is a low configuration tool to generate files based on templates.

Most template generation tools require elaborate configurations, lack intuitive usage, are tied to a specific framework or do not support variable transformations.
The objective of this tool is to be as intuitive as possible while providing a flexible feature set.

Simply create your template files, add them to the configuration file and then run `jatg` to generate the resulting files.

## Setting Up

### Create the `templates.json`

You can create the file by running `npx jatg --init`, or just start by copying the example below:

**templates.json**
```json
{
  "$schema": "https://unpkg.com/jatg/templates.schema.json",
  "templates": [
    {
      "name": "my-awesome-template",
      "sourcePaths": ["./templates"],
      "outputPath": "./src/modules",
      "variables": [
        {
          "variable": "name",
          "name": "Module Name"
        }
      ]
    }
  ]
}
```

This should be enough for most use-cases, but you can read the [configuration reference](./docs/configuration.md) for a list of all possible properties.

### Create your template files

You can have as many files as needed for a single template.

**templates/%name%.ts**
```
export class %name.pascalCase% {
  // ...
}
```

The template can have variables, and they can be transformed through functions. Read more about them in the [variables reference](./docs/variables.md).

### Run it

Just run the CLI to generate files based on the templates created.

You'll be prompted which template you want to generate, and what are the variable values.

```sh
npx jatg
```

Pretty straightforward, isn't it?

---

## Documentation

- [CLI](./docs/cli.md) (jatg)
- [Configuration](./docs/configuration.md) (templates.json)
- [Template Files](./docs/templates.md)
- [Variables](./docs/variables.md)
- [API](./docs/api.md)

---

## Samples

Check the [samples](./samples) directory for config and template examples.
