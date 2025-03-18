([Français](#french-version))

<a id='english-version' class='anchor' aria-hidden='true'/>

## VDM Core libs

This is a mono repo that groups together all of the City of Montreal's core libraries.

The goal is to facilitate the publication of these libraries, which depend on one another, in order to increase the frequency of updates and respond more quickly to detected critical vulnerabilities.

### Details

- This repo relies on [NPM workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to allow libraries to reference each other and share common dependencies.
- This repo relies on https://nx.dev/ to manage dependencies between libraries and schedule tasks.

### Installation

```shell
npm i
```

### Validate

```shell
npm run lint
```

### Testing

```shell
npm test
```

### License

The source code of this project is distributed under the [MIT License](LICENSE).

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md#english-version).

### Code of Conduct

Participation in this poject is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

______________________

([English](#english-version))

<a id='french-version' class='anchor' aria-hidden='true'/>

## Librairies core de la VDM

Ceci est un mono repo qui regroupe toutes les librairies "core" de la Ville de Montréal.

Le but est de faciliter la publication de ces librairies qui dépendent les unes des autres, 
afin d'augmenter la fréquence de mise à jour pour répondre plus rapidement aux vulnérabilités critiques détectées.

### Détails

- Ce repo s'appuie sur [NPM workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) pour permettre aux librairies de se référencer entre elles et partager leurs dépendances communes.  
- Ce repo s'appuie sur https://nx.dev/ pour gérer les dépendances entre les librairies et ordonnancer les tâches

### Installer

```shell
npm i
```

### Valider la conformité

```shell
npm run lint
```

### Tester

```shell
npm test
```

### Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md#french-version)

### Licence et propriété intellectuelle

Le code source de ce projet est libéré sous la licence [MIT License](LICENSE).

### Code de Conduite

La participation à ce projet est réglementée part le [Code de Conduite](CODE_OF_CONDUCT.md#french-version)
