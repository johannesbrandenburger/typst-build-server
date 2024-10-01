import { Hono } from 'hono'
import { $ } from 'bun'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/build', (c) => {
  return c.text('Please use POST method to upload a ZIP file')
})

// this route gets a ZIP file, extracts it, compiles the typst project and returns the compiled pdf
app.post('/build', async (c) => {
  console.log('POST /build');

  // get the key parameter and check if it matches the secret (process.env.TYPST_SECRET)
  const key = c.req.query('key');
  if (key !== process.env.TYPST_SECRET) {
    console.log(key, process.env.TYPST_SECRET);
    return c.body('Invalid key', 401);
  }

  // get the entry file name and check if it is a typst file
  const entryfile = c.req.query('entryfile') || 'main.typ';
  if (!entryfile.endsWith('.typ')) {
    return c.body('Invalid entry filename', 400);
  }

  // get the output file name and check if it is a pdf file
  const outputfile = c.req.query('outputfile') || 'main.pdf';
  if (!outputfile.endsWith('.pdf')) {
    return c.body('Invalid output filename', 400);
  }

  // get the root argument and check if it is a string
  const rootArg = c.req.query('root') || '';

  // get the zip file
  const body = await c.req.parseBody();
  const zip = body['upload'] as File;
  if (zip.type !== 'application/zip') {
    return c.body('Invalid file type', 400);
  }

  // safe the file to disk
  const zipPath = './temp.zip';
  await Bun.write(zipPath, zip);

  // extract the zip file
  await $`mkdir -p ./temp`;
  const extractPath = `./temp/${Date.now()}`;
  await $`unzip ${zipPath} -d ${extractPath}`;
  const projectPath = `${extractPath}/${zip.name.replace('.zip', '')}`;

  // typst compile path/to/source.typ path/to/output.pdf
  const sourcePath = `${projectPath}/${entryfile}`;
  const outputPath = `${projectPath}/${outputfile}`;

  // compile the typst project
  if (rootArg)
    await $`typst compile ${sourcePath} ${outputPath} --root ${rootArg}`;
  else
    await $`typst compile ${sourcePath} ${outputPath}`;

  // read the compiled pdf and clear the temp folder
  const output = await Bun.file(outputPath).arrayBuffer();
  await $`rm -rf ${extractPath}`;
  await $`rm ${zipPath}`;

  // return the compiled pdf
  return c.body(output, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${outputfile}"`
  });

})

export default app
