# Command Line Interface

## Installation

### npx

You can run the generation through npx by simply running the command: `npx jatg`.

### Global

You can also install globally through `npm install --global jatg` and run it directly through `jatg`.

### Project

You can also install it as a dev dependency to your project through `npm install -D jatg` and add a script in your `package.json`:

```json5
{
  // ...
  "scripts": {
    "generate": "jatg"
  }
  // ...
}
```

Then you can run it through `npm run generate`.

## Options

You can also specify options, such as picking a specific template:
```sh
npx jatg --template my-awesome-template
```

Alternatively, you can use environment variables to set the option values.

| Description                                                  | Option                     | Environment Variable        | Default Value      |
|--------------------------------------------------------------|----------------------------|-----------------------------|--------------------|
| Sets the base for other paths                                | `--base-path`, `-b`        | `JATG_BASE_PATH`            | `./`               |
| The path for the configuration file                          | `--templates-config`, `-c` | `JATG_TEMPLATE_CONFIG_PATH` | `./templates.json` |
| Sets which template will be used, which will not be prompted | `--template`, `-t`         | `JATG_TEMPLATE_NAME`        |                    |
| Sets a template variable value, which will not be prompted   |                            | `JATG_VARIABLE_*`[^1]       |                    |
| Whether the generated files should overwrite existing ones   | `--overwrite`, `-o`        |                             | false              |
| Initializes a new template                                   | `--init`                   |                             |                    |
| Converts source files into template files                    | `--convert`                |                             |                    |
| Prints the command manual                                    | `--help`                   |                             |                    |
| Prints the jatg version                                      | `--version`                |                             |                    |

[^1]: Environment variables prefixed with `JATG_VARIABLE_` will fill the respective template variable.
For example, if you want to set the value of a template variable named `foobar`, you can add the environment variable `JATG_VARIABLE_FOOBAR` and it will not be prompted on generation. 
