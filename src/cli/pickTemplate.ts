import prompts from 'prompts';
import { CompositeTemplateModel, TemplateModel } from '../models/template.model.js';
import { JatgError } from '../models/jatg-error.js';

async function promptTemplate(templates: TemplateModel[], composites: CompositeTemplateModel[]): Promise<string> {
  const names = new Set([
    ...composites.map(c => c.name),
    ...templates.map(t => t.name),
  ]);

  if (names.size === 0)
    throw new JatgError('No templates registered. Initialize one with "jatg --init"');

  const { template } = await prompts({
    name: 'template',
    message: 'Template',
    type: 'select',
    choices: [...names].map(name => ({
      value: name,
      title: name,
    })),
  }, {
    onCancel: () => { throw new JatgError('Generation canceled'); }
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

  throw new JatgError(`Template "${template}" was not found`);
}

export async function pickTemplate(templates: TemplateModel[], composites: CompositeTemplateModel[], template?: string): Promise<TemplateModel[]> {
  if (!template)
    template = await promptTemplate(templates, composites);

  return findTemplatesByName(templates, composites, template);
}
