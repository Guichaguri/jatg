# Configuration

The format of the `template.json` file is also documented through the [TemplateConfiguration TypeScript interface](https://github.com/Guichaguri/jatg/blob/main/src/models/template.model.ts) and the [JSON Schema](https://github.com/Guichaguri/jatg/blob/main/templates.schema.json).

## Root

| Property     | Type                                                  | Required | Description                                                        |
|--------------|-------------------------------------------------------|----------|--------------------------------------------------------------------|
| `templates`  | array\<[Template Definition](#template-definition)>   | Required | The list of templates that can be generated                        |
| `composites` | array\<[Composite Definition](#composite-definition)> |          | The list of templates that are a combination of multiple templates |

## Template Definition

| Property      | Type                                                | Required | Description                                                                                      |
|---------------|-----------------------------------------------------|----------|--------------------------------------------------------------------------------------------------|
| `name`        | string                                              | Required | The template name                                                                                |
| `sourcePaths` | array\<string>                                      | Required | The path list of template files or directories containing templates                              |
| `outputPath`  | string                                              | Required | The output directory where the source paths will be copied into. The path can contain variables. |
| `variables`   | array\<[Variable Definition](#variable-definition)> | Required | The variables that the user can type. These variables will be replaced in the final template     |

## Variable Definition

| Property        | Type                   | Required | Description                                                                                                      |
|-----------------|------------------------|----------|------------------------------------------------------------------------------------------------------------------|
| `variable`      | string                 | Required | The variable identification                                                                                      |
| `name`          | string                 |          | A human-redable name                                                                                             |
| `description`   | string                 |          | A human-redable description                                                                                      |
| `type`          | `"text"` \| `"number"` |          | The variable type. This is used for input validation. Defaults to `"text"`.                                      |
| `choices`       | array\<string>         |          | A list of choices that the user can pick. If this property defined, the user can only pick one of these options. |
| `initial`       | string \| number       |          | The initial value                                                                                                |
| `allowEmpty`    | boolean                |          | Whether this variable allows empty values. Defaults to `false`.                                                  |
| `preprocessing` | array\<string>         |          | The list of [formatting functions](./variables.md#formatting-functions) to apply globally for this variable.     |

## Composite Definition

| Property    | Type           | Required | Description                                      |
|-------------|----------------|----------|--------------------------------------------------|
| `name`      | string         | Required | The name of the composite                        |
| `templates` | array\<string> | Required | The list of template names that will be combined |

