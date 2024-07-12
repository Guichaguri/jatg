
export interface TemplateConfiguration {
  /**
   * The list of templates that can be generated
   */
  templates: TemplateModel[];

  /**
   * The list of templates that are a combination of multiple templates
   */
  composites?: CompositeTemplateModel[];
}

export interface TemplateModel {

  /**
   * The template name
   */
  name: string;

  /**
   * The path list of template files or directories containing templates
   */
  sourcePaths: string[];

  /**
   * The output directory where the source paths will be copied into
   */
  outputPath: string;

  /**
   * The variables that the user can type.
   *
   * These variables will be replaced in the final template
   */
  variables: TemplateVariable[];

}

export interface CompositeTemplateModel {

  /**
   * The name of the composite
   */
  name: string;

  /**
   * The list of template names that will be combined
   */
  templates: string[];

}

export interface TemplateVariable {

  /**
   * The variable identification
   */
  variable: string;

  /**
   * A human-readable name
   */
  name?: string;

  /**
   * A human-readable description
   */
  description?: string;

  /**
   * The variable type.
   *
   * This is used for input validation.
   */
  type?: 'text' | 'number';

  /**
   * A list of choices that the user can pick.
   *
   * If this property defined, the user can only pick one of these options.
   */
  choices?: string[];

  /**
   * The initial value
   */
  initial?: string | number;

  /**
   * Whether this variable allows empty values
   */
  allowEmpty?: boolean;

  /**
   * The list of formatting functions to apply globally for this variable
   */
  preprocessing?: VariableOperation[];

}

export type VariableOperation = 'upper' | 'lower' | 'trim' | 'unaccent' | 'camelCase' | 'capitalCase'
  | 'constantCase' | 'dotCase' | 'kebabCase' | 'noCase' | 'pascalCase' | 'pascalSnakeCase' | 'pathCase'
  | 'sentenceCase' | 'snakeCase' | 'trainCase' | 'initials' | 'plural' | 'singular';
