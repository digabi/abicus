[![Digabi logo](https://digabi.fi/images/digabi-logo.png)](https://digabi.fi)

# Digabi

Digabi is a codebase used in the Abitti exam system, the digital exam environment for the [Finnish Matriculation Examination](https://www.ylioppilastutkinto.fi/en).

All bug reports, feature requests, and pull requests are appreciated. However, the following should be kept in mind:

- Pull requests based on submitted issues cannot be implemented due to limited resources. Similarly, upstream issues related to third-party projects in use are not forwarded.
- No guarantee can be given that submitted pull requests will be reviewed.
- Our focus is strictly on the Finnish Matriculation Examination, as defined by law. Issues or pull requests unrelated to this mission will not be addressed.
- Official channels should be used for inquiries. The issue tracker and pull requests are not to be used for general questions or support requests.

Before any contribution is accepted to the codebase, to clarify the intellectual property rights associated with contributions to open-source projects owned by the Finnish Matriculation Examination Board, all contributors must sign and submit a Contribution License Agreement (CLA):

- Individuals should sign and send the [Personal CLA](https://digabi.fi/YTL%20Personal%20CLA.pdf) to [digabi@ylioppilastutkinto.fi](mailto:digabi@ylioppilastutkinto.fi).
- Organizations or corporations should sign and send the [Corporate CLA](https://digabi.fi/YTL%20Corporate%20CLA.pdf) to the same address.

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

</table>
