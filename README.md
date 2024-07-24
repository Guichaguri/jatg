# jatg - just another template generator

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

The format of this file is documented through the [TemplateConfiguration TypeScript interface](https://github.com/Guichaguri/jatg/blob/main/src/models/template.model.ts) and the [JSON Schema](https://github.com/Guichaguri/jatg/blob/main/templates.schema.json). Refer them for a list of all possible properties.

### Create your template files

You can have as many files as needed for a single template.

**templates/%name%.ts**
```
export class %name.pascalCase% {
  // ...
}
```

The template can have variables, and they can be transformed through functions. Read more about them in the [variables section](#variables).

### Run it

Just run the CLI to generate files based on the templates created.

You'll be prompted which template you want to generate, and what are the variable values.

```sh
npx jatg
```

Pretty straightforward, isn't it?

---

## Reference

### Variables

A template can have multiple variables. Those can be defined in the configuration and can be used to make template contents and file names dynamic.

The syntax is the variable name surrounded by percentages (`%variable_name%`) and the value can be formatted through special functions, separated by dots (`%variable_name.upper%`).

For the variable named `entity` and the value `user-post`, here are a few examples:

| Template                        | Result       | What is hapenning?                                                          |
|---------------------------------|--------------|-----------------------------------------------------------------------------|
| `%entity%`                      | `user-post`  | prints the variable value as is                                             |
| `%entity.upper%`                | `USER-POST`  | prints the variable formatted value in uppercase                            |
| `%entity.plural.upper%`         | `USER-POSTS` | prints the variable value formatted in plural and in uppercase              |
| `%entity.plural.dotCase.upper%` | `USER.POSTS` | prints the variable value formatted in plural, in dot case and in uppercase |

Variables can be used in template file contents, the template file name and the configuration `outputPath`.

Variables that are not defined in the configuration file will be ignored and kept as-is. However, valid variables with invalid formatting functions will throw an error.

#### Formatting Functions

##### Basic

These are based on the basic string functions included in JavaScript.

| Function   | Before       | After      |
|------------|--------------|------------|
| `upper`    | "TwoWords"   | "TWOWORDS" |
| `lower`    | "TwoWords"   | "twowords" |
| `trim`     | " TwoWords " | "TwoWords" |
| `unaccent` | "maçã"       | "maca"     |

##### Change Case

These functions use [change-case](https://www.npmjs.com/package/change-case) under the hood.

| Function          | Result      |
|-------------------|-------------|
| `camelCase`       | `twoWords`  |
| `capitalCase`     | `Two Words` |
| `constantCase`    | `TWO_WORDS` |
| `dotCase`         | `two.words` |
| `kebabCase`       | `two-words` |
| `noCase`          | `two words` |
| `pascalCase`      | `TwoWords`  |
| `pascalSnakeCase` | `Two_Words` |
| `pathCase`        | `two/words` |
| `sentenceCase`    | `Two words` |
| `snakeCase`       | `two_words` |
| `trainCase`       | `Two-Words` |
| `initials`        | `TW`        |

##### Pluralize

These functions use [pluralize](https://www.npmjs.com/package/pluralize) under the hood.

| Function   | Result     |
|------------|------------|
| `plural`   | `twoWords` |
| `singular` | `twoWord`  |


### Template files

#### File names and directories

The `sourcePaths` can contain paths to template files and directories containing templates.

For directories, all files inside it will be considered templates.
The directory structure will be kept for the generated results.

The file names don't need to follow any specific extension.
If you prefer, you can end them with `.template`.
The `.template` extension will be removed for the resulting file.

The file names, directories and the `outputPath` can contain [variables](#variables).

Here's an example of the folder structure:
```
templates/
├── entities/
│   └── %name%.entity.ts.template
└── models/
    └── %name%.model.ts.template
```

The templates.json file:
```json5
// templates.json
{
  // ...
  "sourcePaths": ["./templates"],
  "outputPath": "./src/modules/%name%",
  // ...
}
```

The resulting files for the variable `name` being "product":
```
src/
└── modules/
    └── product/
        ├── entities/
        │   └── product.entity.ts
        └── models/
            └── product.model.ts
```

#### Template file contents

Template files must be in plain text encoded in UTF-8.
The files can contain as many [variables](#variables) as needed.

### CLI

#### Install

##### npx

You can run the generation through npx by simply running the command: `npx jatg`.

##### Global

You can also install globally through `npm install --global jatg` and run it directly through `jatg`.

##### Project

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

#### Options

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
| Prints the command manual                                    | `--help`                   |                             |                    |
| Prints the jatg version                                      | `--version`                |                             |                    |

[^1]: Environment variables prefixed with `JATG_VARIABLE_` will fill the respective template variable.
For example, if you want to set the value of a template variable named `foobar`, you can add the environment variable `JATG_VARIABLE_FOOBAR` and it will not be prompted on generation. 
