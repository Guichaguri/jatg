# Template files

## File names and directories

The `sourcePaths` is a list of paths to template files and directories that contain template files.

For directories, all files inside it will be considered templates.
The directory structure will be kept for the generated results.

The file names don't need to follow any specific extension.
If you need to, you can end them with `.template`.
The `.template` extension will be removed for the resulting file.

The file names, directories and the `outputPath` can contain [variables](./variables.md).

Here's an example of the folder structure:
```
templates/
├── entities/
│   └── %name%.entity.ts.template
└── models/
    └── %name%.model.ts.template
```

The [templates.json](./configuration) file:
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

## Template file contents

Template files must be in plain text encoded in UTF-8.
The files can contain as many [variables](./variables.md) as needed.

Here's examples:
```ts
/** A JS class named "%name.pascalCase%.js" */
export class %name.pascalCase%Service {
  
  create%name.pascalCase.singular%(payload) {
    // ...
  }
  
}
```

```html
<!-- An HTML file named "index.html" -->
<html>
  <head>
    <title>%title%</title>
  </head>
  <body>
    <h1>%title%</h1>
    <p>%description%</p>
  </body>
</html>
```
