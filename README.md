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

### Upgrade the dependencies to minor versions for all projects in the mono-repo

- `npm run ncu-fix`
- `npm i`
- `npm run lint`
- `npm test`
- Check that the lint and tests pass before committing
- `git commit -am "upgrade deps to minor versions"`

### Releasing

When you've finished making your changes and are ready to publish, follow these steps:

- Check for compliance (`npm run lint`)
- Check integration tests (`npm test`)
- `npm run bump-versions`

    - You'll need to choose how to bump the version of each library in this monorepo.
    - The version bump should reflect the type of change introduced to the library, as well as the type of dependency update performed. 
      If one of your dependencies changes major version, then you'll also need to force a major version for that library.

- Build everything (`npm run compile`)
- Commit the changes (`git commit -am "bump versions"`)
- Increment the mono-repo version (`npm run bump-core`)
- Push the changes to Github (`git push`)
- Push the new tag to Github (`git push --tags`)
- Go to Github to create a new release (https://github.com/VilledeMontreal/node-core-libs/releases)
    - click the "`Draft a new release`" button
    - click the "`Choose a tag`" selector
    - find the latest released tag
    - click the "`Generate release notes`" button
    - review the description
    - click the "`publish release`" button
    - watch the https://github.com/VilledeMontreal/node-core-libs/actions
    - A new action should be triggered to release the libs
    - once the action successfully completes, you should get a new release for each lib in the npm registry :

        - https://www.npmjs.com/package/@villedemontreal/correlation-id
        - https://www.npmjs.com/package/@villedemontreal/general-utils
        - https://www.npmjs.com/package/@villedemontreal/http-request
        - https://www.npmjs.com/package/@villedemontreal/jwt-validator
        - https://www.npmjs.com/package/@villedemontreal/logger
        - https://www.npmjs.com/package/@villedemontreal/mongo
        - https://www.npmjs.com/package/@villedemontreal/scripting

    - You should advertize the new release in the Teams channel [Développeurs / Annonces](https://teams.microsoft.com/l/channel/19%3A9d04a2581b5f4f8d92922e40730da6e0%40thread.tacv2/%F0%9F%93%A3%20Annonces?groupId=4ea353ba-735e-4c17-b9f6-e41720d6d0e3&tenantId=9f15d2dc-8753-4f83-aac2-a58288d3a4bc)

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

### Mettre à jour les dépendances aux versions mineures pour tous les projets du mono-repo

- `npm run ncu-fix`
- `npm i`
- `npm run lint`
- `npm test`
- vérifier que le lint et les tests passent avant de faire le commit
- `git commit -am "upgrade deps to minor versions"`

### Publier les librairies

Lorsque vous avez fini vos changements et que vous êtes prêt à publier, veuillez suivre les étapes suivantes:

- vérifier la conformité (`npm run lint`)
- vérifier les tests d'intégration (`npm test`)
- `npm run bump-versions`

    - Vous allez devoir choisir comment incrémenter la version de chacune des librairies dans ce mono-repo
    - L'incrément de version doit refléter le type de changement introduit dans la lib, ainsi que le type 
      de mise à jour des dépendances effectué. Si une de vos dépendances change de version majeure, 
      alors vous devrez aussi forcer une version majeure pour la lib en question.

- builder tout (`npm run compile`)
- committer les changements (`git commit -am "bump versions"`)
- incrémenter la version du mono-repo (`npm run bump-core`)
- pousser les changements dans Github (`git push`)
- pousser le nouveau tag dans Github (`git push --tags`)
- aller dans Github pour créer une nouvelle release (https://github.com/VilledeMontreal/node-core-libs/releases)

    - cliquer sur le bouton "`Draft a new release`"
    - Cliquez sur le sélecteur "`Choose atag`""
    - Trouvez le tag le plus récent
    - Cliquez sur le bouton "`Generate release notes`"
    - Consultez la description
    - Cliquez sur le bouton "`Publish release`"
    - Consultez https://github.com/VilledeMontreal/node-core-libs/actions
    - Une nouvelle action devrait être déclenchée pour publier les bibliothèques
    - Une fois l'action terminée, vous devriez obtenir une nouvelle version pour chaque bibliothèque du registre npm :

        - https://www.npmjs.com/package/@villedemontreal/correlation-id
        - https://www.npmjs.com/package/@villedemontreal/general-utils
        - https://www.npmjs.com/package/@villedemontreal/http-request
        - https://www.npmjs.com/package/@villedemontreal/jwt-validator
        - https://www.npmjs.com/package/@villedemontreal/logger
        - https://www.npmjs.com/package/@villedemontreal/mongo
        - https://www.npmjs.com/package/@villedemontreal/scripting

    - Vous devriez annoncer la nouvelle version dans le canal Teams [Développeurs / Annonces](https://teams.microsoft.com/l/channel/19%3A9d04a2581b5f4f8d92922e40730da6e0%40thread.tacv2/%F0%9F%93%A3%20Annonces?groupId=4ea353ba-735e-4c17-b9f6-e41720d6d0e3&tenantId=9f15d2dc-8753-4f83-aac2-a58288d3a4bc)

### Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md#french-version)

### Licence et propriété intellectuelle

Le code source de ce projet est libéré sous la licence [MIT License](LICENSE).

### Code de Conduite

La participation à ce projet est réglementée part le [Code de Conduite](CODE_OF_CONDUCT.md#french-version)
