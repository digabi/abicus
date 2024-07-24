<h1 align="center">
  <img alt="logo" height="100" src="./app-icon.png" />
  <div>Abicus</div>
</h1>

<div align="center">
  
Abicus is a simple **scientific calculator** built on web technologies.

Abicus does not include any symbolic computation capabilities.<br />
It is built for use in the Finnish digital matriculation examinations.

<!--
[Installation]() ⋅
[User Guide]() ⋅
[Development Guide]()
-->

</div>

<div align="center">
<img alt="screenshot" width="375" src="./app-screenshot.png" />
</div>

## Installation

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

This project uses the [Vitest testing framework](https://vitest.dev). After the project has been [set up](#installation), to run all the unit tests for the project you can simply run:

```bash
npm run test
```

Please see the [Vitest CLI documentation](https://vitest.dev/guide/cli.html) for details on e.g. how to filter which tests to run etc.

---

<div align="center">

| [![Abitti.dev](https://abitti.dev/images/abittidev_logo.svg)](https://abitti.dev/) | <ul><li><a href="https://abitti.dev">Abitti.dev</a></li><li><a href="https://abitti.dev/abitti-trademark.html">Use of Abitti Trademark policy</a></li></ul> |
| ---------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |

</div>
