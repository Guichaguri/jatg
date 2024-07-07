# JATG - Just Another Template Generator

## Variables

Variables are formatted between percentages and may include formatting functions.

For the variable named `entity` and the value `user-post`, here are a few examples:

| Template                        | Result       | Description                                                                 |
|---------------------------------|--------------|-----------------------------------------------------------------------------|
| `%entity%`                      | `user-post`  | prints the variable value as is                                             |
| `%entity.upper%`                | `USER-POST`  | prints the variable formatted value in uppercase                            |
| `%entity.plural.upper%`         | `USER-POSTS` | prints the variable value formatted in plural and in uppercase              |
| `%entity.plural.dotCase.upper%` | `USER.POSTS` | prints the variable value formatted in plural, in dot case and in uppercase |

Variables can be used in template file contents, the file name and the directory name.

### Formatting Functions

#### Basic

These are based on the basic string functions included in JavaScript.

| Function          | Result     |
|-------------------|------------|
| `upper`           | ` SAMPLE ` |
| `lower`           | ` sample ` |
| `trim`            | `sample`   |

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
