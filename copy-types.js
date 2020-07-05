const fs = require('fs');
const src = 'src/aria-autocomplete-types.d.ts';
const dest = 'dist/index.d.ts';

fs.copyFile(src, dest, (err) => {
    if (err) throw err;
    console.log(`${src} was copied to ${dest}`);
});
