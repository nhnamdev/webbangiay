const fs = require('fs');
const path = require('path');

let routes = [];
let imports = [];

let componentIndex = 0;

function scanDir(dir, routePrefix) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (let item of items) {
        let fullPath = path.join(dir, item);
        let stat = fs.lstatSync(fullPath);
        if (stat.isDirectory()) {
            // Ignore api folders
            if (item === 'api') continue;
            
            let nextRoutePrefix = routePrefix;
            // Ignore group folders like (main), (auth) in the URL
            if (!item.startsWith('(') && !item.startsWith(')')) {
                nextRoutePrefix = routePrefix === '/' ? `/${item}` : `${routePrefix}/${item}`;
            }
            scanDir(fullPath, nextRoutePrefix);
        } else if (item.startsWith('page.')) {
            // It's a page component
            let componentName = `Page${componentIndex++}`;
            let relativePath = fullPath.replace(/\\/g, '/');
            
            // Remove extension for import
            relativePath = relativePath.replace(/\.(jsx?|tsx?)$/, '');
            
            // Make path relative to src/App.jsx
            let importPath = `../${relativePath}`;
            imports.push(`import ${componentName} from '${importPath}';`);

            // Format route parameter [id] -> :id
            let routePath = routePrefix.replace(/\[([^\]]+)\]/g, ':$1');
            
            routes.push(`        <Route path="${routePath}" element={<${componentName} />} />`);
        }
    }
}

scanDir('app', '/');

const appJsxContent = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${imports.join('\n')}
import Providers from '../components/providers/Providers'; // Assuming Providers exists

function App() {
  return (
    <BrowserRouter>
        <Providers>
          <Routes>
${routes.join('\n')}
          </Routes>
        </Providers>
    </BrowserRouter>
  );
}

export default App;
`;

fs.writeFileSync('src/App.jsx', appJsxContent, 'utf-8');
console.log('src/App.jsx generated successfully.');
