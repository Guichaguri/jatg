# Variables

A template can have multiple variables. Those can be defined in the configuration and can be used to make template contents and file names dynamic.

The syntax is the variable name surrounded by percentages (`%variable_name%`) and the value can be formatted through special functions, separated by dots (`%variable_name.upper%`).

You can chain as many formatting functions as needed.

For the variable named `entity` and the value `user-post`, here are a few examples:

| Template                        | Result       | What is hapenning?                                                          |
|---------------------------------|--------------|-----------------------------------------------------------------------------|
| `%entity%`                      | `user-post`  | prints the variable value as-is                                             |
| `%entity.upper%`                | `USER-POST`  | prints the variable formatted value in uppercase                            |
| `%entity.plural.upper%`         | `USER-POSTS` | prints the variable value formatted in plural and in uppercase              |
| `%entity.plural.dotCase.upper%` | `USER.POSTS` | prints the variable value formatted in plural, in dot case and in uppercase |

Variables can be used in template file contents, the template file name and the configuration `outputPath`.

Variables that are not defined in the configuration file will be ignored and kept as-is. However, valid variables with invalid formatting functions will throw an error.

## Formatting Functions

### Basic

These are based on the basic string functions included in JavaScript.

| Function   | Before       | After      |
|------------|--------------|------------|
| `upper`    | "TwoWords"   | "TWOWORDS" |
| `lower`    | "TwoWords"   | "twowords" |
| `trim`     | " TwoWords " | "TwoWords" |
| `unaccent` | "maçã"       | "maca"     |

### Change Case

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

### Pluralize

These functions use [pluralize](https://www.npmjs.com/package/pluralize) under the hood.

| Function   | Result     |
|------------|------------|
| `plural`   | `twoWords` |
| `singular` | `twoWord`  |
