const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
        // Calling the super constructor is important so our generator is correctly set up
        super(args, opts);

        // Next, add your custom code
        // This makes `appname` a required argument.
        //this.argument('name', { type: String, required: true });
    }


    

    prompting() {

        const writing = (name, modelName, tableName ) => {
            this.fs.copyTpl(
                this.templatePath('./model/template_model'),
                this.destinationPath(`../api/${name}/model.js`),
                {   name: name,
                    modelName: modelName,
                    tableName:tableName
                }
            );
        }
        
        return this.prompt([{
            type    : 'input',
            name    : 'name',
            message : 'What is the name of your api?'
        }]).then((answers) => {
            
            const name = answers.name.toLowerCase();
            const modelName = name.charAt(0).toUpperCase()+name.slice(1);
            const tableName =  name+'s';
            if(name) {
                console.log(name)
                writing(name, modelName, tableName);
            }
            
        });
    }
};