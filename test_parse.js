const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\fenc07837\\Downloads\\ai_datacenter_presentation.tsx', 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

let slidesFound = 0;
let slidesWithContent = 0;

traverse(ast, {
  VariableDeclarator(path) {
    if (path.node.id.name === 'slides') {
      console.log('Found slides array');
      if (path.node.init.type === 'ArrayExpression') {
        slidesFound = path.node.init.elements.length;
        console.log(`Total slides: ${slidesFound}`);

        path.node.init.elements.forEach((element, index) => {
          if (element.type === 'ObjectExpression') {
            element.properties.forEach(prop => {
              if (prop.key.name === 'content') {
                slidesWithContent++;
                console.log(`\nSlide ${index + 1}:`);
                console.log(`  - Has content property: YES`);
                console.log(`  - Content type: ${prop.value.type}`);

                if (prop.value.type === 'ArrowFunctionExpression') {
                  console.log(`  - Body type: ${prop.value.body.type}`);

                  if (prop.value.body.type === 'JSXElement') {
                    console.log(`  - JSX Element found directly`);
                    console.log(`  - Element name: ${prop.value.body.openingElement.name.name}`);
                  } else if (prop.value.body.type === 'BlockStatement') {
                    const returnStmt = prop.value.body.body.find(s => s.type === 'ReturnStatement');
                    if (returnStmt && returnStmt.argument) {
                      console.log(`  - Return statement found`);
                      console.log(`  - Return type: ${returnStmt.argument.type}`);
                      if (returnStmt.argument.type === 'JSXElement') {
                        console.log(`  - JSX Element name: ${returnStmt.argument.openingElement.name.name}`);
                        console.log(`  - Children count: ${returnStmt.argument.children.length}`);
                      }
                    }
                  }
                }
              }
            });
          }
        });
      }
    }
  }
});

console.log(`\n=== Summary ===`);
console.log(`Slides found: ${slidesFound}`);
console.log(`Slides with content: ${slidesWithContent}`);
