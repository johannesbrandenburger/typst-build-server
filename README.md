# Typst Build Server

This project is a server that compiles a Typst project into a PDF. It accepts a ZIP file containing the Typst source files, extracts and compiles the project, and returns the compiled PDF.

## Features

- Accepts ZIP files with Typst projects.
- Compiles the specified Typst file into a PDF.
- Allows configuration of entry files, output names, and project root directories.
- Secures the build process with an API key.

## Endpoint: **POST /build**

This endpoint accepts a ZIP file containing the Typst project, extracts it, compiles the project, and returns the compiled PDF. The request must include an API key and specify the entry and output file names.

#### Request Parameters:

- `key` (required): A query parameter that must match the secret key (`TYPST_SECRET`) stored in environment variables. This is used for authentication.
- `entryfile` (optional): The name of the entry Typst file within the ZIP. Defaults to `main.typ`. Must end with `.typ`.
- `outputfile` (optional): The name of the compiled PDF file. Defaults to `main.pdf`. Must end with `.pdf`.
- `root` (optional): Specifies a root directory if needed for compilation. This is useful when setting up file paths within the Typst project.

#### Request Body:

- The request body must contain the ZIP file under the `upload` field.
- The ZIP file must be a valid Typst project archive with the correct entry file specified.

#### Responses:

- **200 OK**: Returns the compiled PDF as a response with `application/pdf` content type.
- **400 Bad Request**: Returned if the request contains invalid parameters (e.g., wrong file type or filename).
- **401 Unauthorized**: Returned if the `key` parameter does not match the secret.

---

## Demo Request

Here is an example of how to make a request to the `/build` endpoint using `curl`:

```bash
curl -X POST http://localhost:3000/build \
  -H "Content-Type: multipart/form-data" \
  -F "upload=@your-project.zip" \
  -F "entryfile=main.typ" \
  -F "outputfile=compiled.pdf" \
  -F "key=your_secret_key" \
    --output compiled.pdf
```

In this example:

- `your-project.zip` is the ZIP file containing your Typst project.
- `main.typ` is the entry file for the project.
- `compiled.pdf` is the name of the generated PDF.
- `your_secret_key` is the secret key for authentication.

## Environment Variables

- `TYPST_SECRET`: The secret key used to authenticate requests to the server.

---

## Requirements (see below for Docker setup)

- **Typst**: Ensure that Typst is installed on the system, as it's required for compiling the projects.
- **Bun**: The project uses Bun.js for file handling and running shell commands.

---

## Setup

1. Clone the repository.
2. Install the dependencies using Bun:
   ```bash
   bun install
   ```
3. Set up the environment variable `TYPST_SECRET` for authentication.
4. Start the server:
   ```bash
   bun run index.ts
   ```
5. The server will be accessible at `http://localhost:3000`.


---

## Docker

You can also run the server using Docker. Here's how to build and run the Docker image:

1. Build the Docker image:
   ```bash
   docker build -t typst-build-server .
   ```
2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 -e TYPST_SECRET=your_secret_key typst-build-server
   ```
3. The server will be accessible at `http://localhost:3000`.
