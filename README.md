<h1 align="center">
  <img alt="logo" height="100" src="./app-icon.png" />
  <div>Abicus</div>
</h1>

<div align="center">
  
Abicus is a simple **scientific calculator** built on web technologies.

Abicus does not include any symbolic computation capabilities.  
It is built for use in the Finnish digital matriculation examinations.

</div>

<div align="center">
<img alt="screenshot" width="375" src="./app-screenshot.png" />
</div>

> [!NOTE]
> The calculator was developed especially to be an example of an Abitti 2 application. The source code, the Abitti 2 container, and precompiled binaries of the calculator are made available to the public for demonstration purposes only. The matriculation examination board does not provide support for e.g. installing the precompiled binaries.
>
> We request that any errors in the program are reported to Abitti-support (abitti@ylioppilastutkinto.fi)

<!--
[Installation]() ⋅
[User Guide]() ⋅
[Development Guide]()
-->

## Development Setup

Clone this repository and make sure you have [Node.js](https://nodejs.org/) installed on your system. The exact version used in development can be found in the [`.nvmrc` file](./.nvmrc).

If you want to develop the desktop application, you will additionally need to have a [Rust](https://www.rust-lang.org/) toolchain installed on your system. Please then also follow the [Tauri set-up instructions for your system](https://tauri.app/v1/guides/getting-started/prerequisites/).

When Node.js is ready and this repository has been cloned, install the packages by running the following in the cloned directory:

```bash
npm install
```

After all the required packages have been installed, run one of the following commands to start the development server:

- For the web-application only:

  ```bash
  npm run dev
  ```

- For the web-application and the desktop application:
  ```bash
  npm run tauri dev
  ```

## Tests

This project uses the [Vitest testing framework](https://vitest.dev) for unit tests and [Playwright](https://playwright.dev) for UI tests. After the project has been [set up](#installation), to run all the tests for the project you can simply run:

```bash
npm run test
```

To run only the unit tests:

```bash
npm run test:unit
```

And to only run the UI tests:

```bash
npm run test:ui
```

Please see the Vitest and/or Playwright documentation for details on e.g. how to filter which tests to run etc.

---

<div align="center">

<table>
  <tr>
    <td>
      <a href="https://abitti.net/">
        <img width="400" src="https://abitti.net/images/abittinet_logo.svg" />
      </a>
    </td>
    <td>
      <ul><li><a href="https://abitti.net">Abitti.net</a></li><li><a href="https://abitti.net/abitti-trademark.html">Use of Abitti Trademark policy</a></li></ul>
    </td>
  </tr>
</table>
