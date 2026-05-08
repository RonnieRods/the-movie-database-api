# React + Vite + TMDB

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# What does this project involve?

This project involves a list of operations:
* **Movie/TV Toggle** with dynamic fetching.
* **Genre Filtering** for both media types.
* **Cross-page Search** via URL parameters.
* **Global Watchlist** using React Context.
* **Detail Pages** with backdrop, cast, trailers and recommendations.

# Site not working?

The site will not work unless you have an API key which you can register and sign up for [here](https://www.themoviedb.org/).

## Next steps

Since the site is ran using Vite React, you need to create an emv file for your private API key from TMDB. To so do simply add a file named .env in the root folder of the app and enter this VITE_TMDB_API_KEY=YourPrivateAPIKeyGoesHere.

Once you save that and relaunch the app, you should see the database API working and enjoy the site at it's fullest!