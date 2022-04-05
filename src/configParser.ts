import { compile } from 'json-schema-to-typescript';
import fs from 'fs';


function parse(config:any, name: string){
  compile(config[name], name)
    .then(x => x.split('?').join('').replace('  [k: string]: unknown;', '').replace('[]', ''))
    .then(data => fs.writeFileSync('src/config/' +name +'.d.ts', data));
}

fs.readFile('./config.schema.json', 'utf8', (err, data) => {
  const config = JSON.parse(data).schema;
  parse(config, 'api');
  parse(config, 'relays');
  parse(config, 'graduals');
  parse(config, 'analogInputs');
  parse(config, 'inputs');
});
