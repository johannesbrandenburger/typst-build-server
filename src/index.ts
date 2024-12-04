import { Hono } from 'hono'
import { $, file } from 'bun'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Server is running... Please use POST "/build" to compile a typst project')
})

app.get('/build', (c) => {
  return c.text('Please use POST method to upload a ZIP file')
})

// this route gets a ZIP file, extracts it, compiles the typst project and returns the compiled pdf
app.post('/build', async (c) => {
  console.log('POST /build');

  const body = await c.req.parseBody();

  // get the key parameter and check if it matches the secret (process.env.TYPST_SECRET)
  const key = c.req.query('key') || body['key'] as string || '';
  if (key !== process.env.TYPST_SECRET) {
    console.log(key, process.env.TYPST_SECRET);
    return c.body('Invalid key', 401);
  }

  // get the entry file name and check if it is a typst file
  const entryfile = c.req.query('entryfile') || body['entryfile'] as string || 'main.typ';
  if (!entryfile.endsWith('.typ')) {
    return c.body('Invalid entry filename', 400);
  }

  // get the output file name and check if it is a pdf file
  const outputfile = c.req.query('outputfile') || body['outputfile'] as string || 'main.pdf';
  if (!outputfile.endsWith('.pdf')) {
    return c.body('Invalid output filename', 400);
  }

  // get the root argument and check if it is a string
  const rootArg = c.req.query('root') || body['root'] as string || '';

  // get the zip file
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

  // check if it has to be with the name of the zip file or not
  let projectPath = `${extractPath}`;
  let entryFile = await file(`${projectPath}/${entryfile}`).exists();
  if (!entryFile) {
    projectPath = `${extractPath}/${zip.name.replace('.zip', '')}`;
  }

  // if entryfile is still not found, return an error
  entryFile = await file(`${projectPath}/${entryfile}`).exists();
  if (!entryFile) {
    return c.body('Entry file not found', 404);
  }

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
