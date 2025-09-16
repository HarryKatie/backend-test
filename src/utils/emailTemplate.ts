import fs from 'fs';
import path from 'path';

export const loadTemplate = (templateName: string, variables: Record<string, string>): string => {
    const filePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let template = fs.readFileSync(filePath, 'utf-8');

    // Replace all {{variable}} placeholders
    for (const key in variables) {
        const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        template = template.replace(pattern, variables[key]);
    }

    return template;
};
