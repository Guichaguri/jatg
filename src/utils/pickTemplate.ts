import prompts from 'prompts';
import { CompositeTemplateModel, TemplateModel } from '../models/template.model.js';

async function promptTemplate(templates: TemplateModel[], composites: CompositeTemplateModel[]): Promise<string> {
  const names = new Set([
    ...composites.map(c => c.name),
    ...templates.map(t => t.name),
  ]);

  const { template } = await prompts({
    name: 'template',
    message: 'Template',
    type: 'select',
    choices: [...names].map(name => ({
      value: name,
      title: name,
    })),
  });

  return template;
}

function findTemplatesByName(templates: TemplateModel[], composites: CompositeTemplateModel[], template: string): TemplateModel[] {
  const composite = composites.find(c => c.name === template);

  if (composite)
    return composite.templates.flatMap(name => findTemplatesByName(templates, composites, name));

  const singleTemplate = templates.find(t => t.name === template);

  if (singleTemplate)
    return [singleTemplate];

  return [];
}

export async function pickTemplate(templates: TemplateModel[], composites: CompositeTemplateModel[], template?: string): Promise<TemplateModel[]> {
  if (!template)
    template = await promptTemplate(templates, composites);

  return findTemplatesByName(templates, composites, template);
}
