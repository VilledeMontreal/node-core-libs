# @villdemontreal/utils-oracle

Module d'utilitaires pour les connections d'Oracle. Fourni des fonction s pour
la création des paramètres pour le procédures stockés d'oracle.

## Availabililty

https://bitbucket.org/villemontreal/core-utils-oracle-nodejs-lib
https://github.com/VilledeMontreal/node-core-libs/tree/main/packages/node-utils-oracle

## Installation

Installer la bibliothèque:

```shell
    npm install --save @villedemontreal/utils-oracle
```

## Utilisation

### Configurations

Un code utilisant cette librarie doit premièrement la configurer en appellant la fonction
"`ìnit(...)`" exportée par le fichier "`src/config/init.ts`".

La configuration "`loggerCreator`" est _requise_ par cette librairie. Cela signifie qu'un code utilisant la librairie
(que ce soit du code d'un projet d'API ou d'une autre librairie) _doit_ setter cette configuration _avant_ que les composants
de la librairie ne soient utilisés.

Par exemple, dans un projet d'API basé sur le générateur
[generator-mtl-node-api](https://bitbucket.org/villemontreal/generator-mtl-node-api), ceci sera effectué dans le
fichier "`src/init.ts`", au début de la fonction `initComponents()` :

```typescript
import { init as initXXXXX } from '@villedemontreal/votre-librairie-XXXXX-nodejs-lib';
import { createLogger } from './utils/logger';

// ...

export async function initComponents() {
  initXXXXX(createLogger);

  //...
}
```

Si vous configurez la librairie depuis _une autre librairie_, vous aurez à passer
le "`Logger Creator`" que vous aurez _vous-même_ reçu comme configurations! :

```typescript
import { init as initXXXXX } from '@villedemontreal/votre-librairie-XXXXX-nodejs-lib';
import { configs } from './configs';

// ...

export async function initComponents() {
  initXXXXX(configs.loggerCreator);

  //...
}
```

Le but étant que toutes les librairies utilisées dans un projet d'API, ainsi que leurs propres librairies
transitives, puissent logger de la même manière et aient accès aux bons Correlation Ids.

Finalement, notez qu'une fonction "`isInited()`" est exportée et permet au code appelant de valider que la librairie a été
configurée correctement!

# Builder le projet

**Note**: Sur Linux/Mac assurz-vous que le fichier `run` est exécutable. Autrement, lancez `chmod +x ./run`.

Pour lancer le build :

- > `run compile` ou `./run compile` (sur Linux/Mac)

Pour lancer les tests :

- > `run test` ou `./run test` (sur Linux/Mac)

# Mode Watch

Lors du développement, il est possible de lancer `run watch` (ou `./run watch` sur Linux/mac) dans un terminal
externe pour démarrer la compilation incrémentale. Il est alors possible de lancer certaines _launch configuration_
comme `Debug current tests file - fast` dans VsCode et ainsi déboguer le fichier de tests présentement ouvert sans
avoir à (re)compiler au préalable (la compilation incrémentale s'en sera chargé).

Notez que, par défaut, des _notifications desktop_ sont activées pour indiquer visuellement si la compilation
incrémentale est un succès ou si une erreur a été trouvée. Vous pouvez désactiver ces notifications en utilisant
`run watch --dn` (`d`isable `n`otifications).

# Déboguer le projet

Trois "_launch configurations_" sont founies pour déboguer le projet dans VSCode :

- "`Debug all tests`", la launch configuration par défaut. Lance les tests en mode debug. Vous pouvez mettre
  des breakpoints et ils seront respectés.

- "`Debug a test file`". Lance _un_ fichier de tests en mode debug. Vous pouvez mettre
  des breakpoints et ils seront respectés. Pour changer le fichier de tests à être exécuté, vous devez modifier la ligne appropriée dans le fichier "`.vscode/launch.json`".

- "`Debug current tests file`". Lance le fichier de tests _présentement ouvert_ dans VSCode en mode debug. Effectue la compîlation au préalable.

- "`Debug current tests file - fast`". Lance le fichier de tests _présentement ouvert_ dans VSCode en mode debug. Aucune compilation
  n'est effectuée au préalable. Cette launch configuration doit être utilisée lorsque la compilation incrémentale roule (voir la section "`Mode Watch`" plus haut)

# Test et publication de la librairie sur Nexus

En mergant une pull request dans la branche `develop`, un artifact "`-pre.build`" sera créé automatiquement dans Nexus. Vous
pouvez utiliser cette version temporaire de la librairie pour bien la tester dans un réel projet.

Une fois mergée dans `master`, la librairie est définitiement publiée dans Nexus, en utilisant la version spécifiée dans
le `package.json`.

# Versions et compatibilité

### 7.2.0

Utilise la version 5.2.0 de oracledb

### 7.0.0

Utilise la version 5.0.0 de oracledb

#### Compatibilité

- NodeJS : 10.16, 12, 14
- Oracle client : 11.2, 12, 18, 19

### 6.1.3

#### Compatibilité

- NodeJS: 10.15 et -
- Oracle client : 11.2, 12

## Artifact Nexus privé, lors du développement

Lors du développement d'une nouvelle fonctionnalité, sur une branche `feature`, il peut parfois être
utile de déployer une version temporaire de la librairie dans Nexus. Ceci permet de bien tester
l'utilisation de la librairie modifiée dans un vrai projet, ou même dans une autre librairie
elle-même par la suite utilisée dans un vrai projet.

Si le code à tester est terminé et prêt à être mis en commun avec d'autres développeurs, la solution
de base, comme spécifiée à la section précédante, est de merger sur `develop`: ceci créera
automatiquement un artifact "`-pre-build`" dans Nexus. Cependant, si le code est encore en développement
et vous désirez éviter de polluer la branche commune `develop` avec du code temporaire, il y a une
solution permettant de générer un artifact "`[votre prénom]-pre-build`" temporaire dans Nexus,
à partir d'une branche `feature` directement:

1. Checkoutez votre branche `feature` dans une branche nommée "`nexus`". Ce nom est
   important et correspond à une entrée dans le `Jenkinsfile`.
2. Une fois sur la branche `nexus`, ajoutez un suffixe "`-[votre prénom]`" à
   la version dans le `package.json`, par exemple: "`5.15.0-roger`".
   Ceci permet d'éviter tout conflit dans Nexus et exprime clairement qu'il
   s'agit d'une version temporaire pour votre développement privé.
3. Commitez et poussez la branche `nexus`.
4. Une fois le build Jenkins terminé, un artifact pour votre version aura été
   déployé dans Nexus. Détruire votre branche dans Bitbucket pour permettre aux
   autres developpeurs d'utiliser cette approche.

**Notez** que, lors du développement dans une branche `feature`, l'utilisation d'un simple
`npm link` local peut souvent être suffisant! Mais cette solution a ses limites, par exemple si
vous désirez tester la librairie modifiée _dans un container Docker_.

# Aide / Contributions

Pour obtenir de l'aide avec cette librairie, vous pouvez poster sur la salle Google Chat [dev-discussions](https://chat.google.com/room/AAAASmiQveI).

Notez que les contributions sous forme de pull requests sont bienvenues.
