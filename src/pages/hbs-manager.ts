import * as handlebars from  "handlebars";
const fs = require("fs");
const path = require("path");


class TemplateManager {
  preCompiledTemplates: Map<string,HandlebarsTemplateDelegate>;

  constructor(partialsPath = "./src/pages/partials") {
    
    this.preCompiledTemplates = new Map<string,HandlebarsTemplateDelegate>();
    this.registerPartials(partialsPath);
  }

  registerPartials(partialsPath:string)  {
    
    for (let template of fs.readdirSync(partialsPath)) {
      if (template.endsWith(".hbs")) {
        let fullPath = path.join(partialsPath, template);
        console.log('loading template ', fullPath);   
        const name = template.split(".")[0];
        console.log('name', name);
        handlebars.registerPartial(name ,fs.readFileSync(fullPath).toString());
      }
    }
  };

 
  async render (templateName:string, values: object): Promise<string>  {
    const path = `./src/pages/${templateName}.hbs`;
    
    if (!this.preCompiledTemplates.hasOwnProperty(path)) {
      const template = await fs.promises.readFile(`./src/pages/${templateName}.hbs`);
      let templateResult = handlebars.compile(template.toString());
      this.preCompiledTemplates.set(path, templateResult);
    }
    let compiledTemplate = this.preCompiledTemplates.get(path);
    if(compiledTemplate) {
        return compiledTemplate(values);
    } else {
        throw "template error";
    }
  }
};


export const templateManager = new TemplateManager();
