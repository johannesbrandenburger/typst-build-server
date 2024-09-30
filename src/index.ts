import { Hono } from 'hono'
import { $ } from 'bun'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// this route gets a ZIP file, extracts it, compiles the typst project and returns the compiled pdf
app.post('/build', async (c) => {
  console.log('POST /build');

  // get the zip file
  const body = await c.req.parseBody();
  const zip = body['upload'] as File;
  if (zip.type !== 'application/zip') {
    return c.text('Invalid file type');
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
  const sourcePath = `${projectPath}/main.typ`;
  const outputPath = `${projectPath}/main.pdf`;

  // compile the typst project
  await $`typst compile ${sourcePath} ${outputPath}`;

  // read the compiled pdf and clear the temp folder
  const output = await Bun.file(outputPath).arrayBuffer();
  await $`rm -rf ${extractPath}`;

  // return the compiled pdf
  return c.body(output, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="main.pdf"',
  });

})

export default app
