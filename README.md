# market-sim
## spec
Thinking about what I'm looking to achieve with this project.
- Gaussian random walk
    - Goal: To get a sense of the overall shape of the market in an abstract sense (stripping away non-random factors that are present in real life). Are there implicit factors in the definition of a market which result in statistically significant patterns?
    - Assume orders come from a normal PDF mirroring a fair market. (We make traders as unpredictable/random as possible, no emotions/reaction to news).
    - Auction price it (maximise satisfaction) mirroring overnight orders -> single opening price.
    - For the purpose of this sim I don't care about the continuous trading day.
    - I just take a sample from a normal PDF of price expectations centered around yesterday's price -> mirroring the assumption that what works yesterday will work today.
    - Also, I'm ignoring that buyers and sellers can have different expectations/PDF's (not necessary for my needs).
    - Simulation 1 - control, capital independent
        - We give the traders infinite money -> orders offered are independent of the price level -> daily price changes are independent of the absolute price level.
        - i.e. Each day is an independent experiment.
        - We assume a uniform order volume distribution.
    - Simulation 2 - capital dependent
        - We limit the trader's money.
        - How does this impact supply and demand? Are there any asymmetries?
    - Simulation 3, 4 - we routinely give/take trader capital to observe capital injection/decay. Is it the same as a random walk with drift?
    - Simulation 5 - increasing volume
    
- intuitive understanding of supply, demand, and volume and it's reaction to news/sentiment.

# progress
- [ ] supply and demand viz
- [ ] price and volume viz
- [ ] Gaussian random walk sims
- [ ] ?

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
