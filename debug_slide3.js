const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const t = require('@babel/types');

const code = fs.readFileSync('c:\\Users\\fenc07837\\Downloads\\ai_datacenter_presentation.tsx', 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

function extractText(jsx) {
  if (!jsx) return '';

  if (t.isJSXText(jsx)) {
    return jsx.value.trim();
  }

  if (t.isJSXElement(jsx)) {
    let text = '';
    jsx.children?.forEach(child => {
      text += extractText(child) + ' ';
    });
    return text.trim();
  }

  if (t.isJSXExpressionContainer(jsx)) {
    if (t.isStringLiteral(jsx.expression)) {
      return jsx.expression.value;
    }
  }

  return '';
}

function getClassName(jsx) {
  if (!jsx || !jsx.openingElement) return '';

  let className = '';
  jsx.openingElement.attributes.forEach(attr => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
      if (t.isStringLiteral(attr.value)) {
        className = attr.value.value;
      }
    }
  });

  return className;
}

function analyzeElement(jsx, depth = 0) {
  if (!t.isJSXElement(jsx)) return;

  const indent = '  '.repeat(depth);
  const tagName = jsx.openingElement.name.name;
  const className = getClassName(jsx);
  const text = extractText(jsx);

  console.log(`${indent}<${tagName}> class="${className}"`);

  if (text && text.length < 100) {
    console.log(`${indent}  Text: "${text}"`);
  }

  jsx.children?.forEach(child => {
    if (t.isJSXElement(child)) {
      analyzeElement(child, depth + 1);
    }
  });
}

traverse(ast, {
  VariableDeclarator(path) {
    if (t.isIdentifier(path.node.id) && path.node.id.name === 'slides') {
      if (t.isArrayExpression(path.node.init)) {
        // 第3張投影片 (index 2)
        const slide3 = path.node.init.elements[2];

        if (t.isObjectExpression(slide3)) {
          slide3.properties.forEach(prop => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'content') {
              console.log('=== Slide 3: 既有IDC升級AI機房 ===\n');

              if (t.isJSXElement(prop.value)) {
                analyzeElement(prop.value);
              }
            }
          });
        }
      }
    }
  }
});
