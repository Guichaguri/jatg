# JATG - Just Another Template Generator

Low configuration CLI to generate files based on templates.

## Setting Up

1. Create the `templates.json` configuration file
2. Create your template files
3. Generate the files by running `jatg`

## Configuration

The configuration is a JSON file named `templates.json`. Here's an example:

```json
{
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
  ],
  "$schema": "node_modules/jatg/templates.schema.json"
}
```

The format of this file is documented through the [TemplateConfiguration TypeScript interface](https://github.com/Guichaguri/jatg/blob/main/src/models/template.model.ts) and the [JSON Schema](https://github.com/Guichaguri/jatg/blob/main/templates.schema.json). Refer them for a list of all possible properties.

## Variables

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

### Formatting Functions

#### Basic

These are based on the basic string functions included in JavaScript.

| Function          | Result     |
|-------------------|------------|
| `upper`           | `TWOWORDS` |
| `lower`           | `twowords` |

#### Change Case

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

#### Pluralize

These functions use [pluralize](https://www.npmjs.com/package/pluralize) under the hood.

| Function   | Result     |
|------------|------------|
| `plural`   | `twoWords` |
| `singular` | `twoWord`  |


## Running

Run the generation by simply running the command below.

```sh
jatg
```

You can also specify options, such as picking a specific template:
```sh
jatg --template my-awesome-template
```

For a list of options, run `jatg --help`.
