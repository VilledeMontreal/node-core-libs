# @villemontreal/core-utils-general-nodejs-lib

Ensemble d'utilitaires généraux.

Fournie également des constantes globales, par exemple les noms d'environnements
standardisés pour nos projets.

## Availabililty

https://bitbucket.org/villemontreal/core-utils-general-nodejs-lib

## Installation

Install it:

```shell
    npm install @villemontreal/core-utils-general-nodejs-lib
    yarn add @villemontreal/core-utils-general-nodejs-lib
```

## Usage

Exemple :

```typescript
import { utils } from '@villemontreal/core-utils-general-nodejs-lib';
```

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

# Notes sur la dépendance "@villemontreal/core-utils-scripting-core-nodejs-lib"

Pour éviter d'avoir une hiérarchie trop profonde dans `node_modules`, nous incluons la librarie de scripting
"`@villemontreal/core-utils-scripting-core-nodejs-lib`" en spécifiant uniquement _sa version majeure_
(par exemple: "`^1`" ou "`^2`"). La raison est que cette librairie de scripting, ainsi que la librairie présente,
s'utilisent chacune mutuellement. En spécifiant uniquement la version majeure de la librairie
de scripting, seul _le plus récent artifact_ à cette version majeure sera ajouté ici au `node_modules`.

**Note**: Si jamais un jour il y a des scripts custom d'ajouter à cette librairie, il faudra aussi s'assurer
de ne pas provoquer de dépendances circulaires en important des composants de la librairie de scripting qui eux-mêmes importeraient en ce faisant des composants de la librairie présente! D'hériter de la classe `ScriptBase` serait,
cela dit, sans problème car cet import ne génère aucune dépendance circulaire.

# Test et publication de la librairie sur Nexus

En mergant une pull request dans la branche `develop`, un artifact "`-pre.build`" sera créé automatiquement dans Nexus. Vous
pouvez utiliser cette version temporaire de la librairie pour bien la tester dans un réel projet.

Une fois mergée dans `master`, la librairie est définitiement publiée dans Nexus, en utilisant la version spécifiée dans
le `package.json`.

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
   déployé dans Nexus.

**Notez** que, lors du développement dans une branche `feature`, l'utilisation d'un simple
`npm link` local peut souvent être suffisant! Mais cette solution a ses limites, par exemple si
vous désirez tester la librairie modifiée _dans un container Docker_.

# Aide / Contributions

Pour obtenir de l'aide avec ce gabarit, vous pouvez poster sur la salle Google Chat [dev-discussions](https://chat.google.com/room/AAAASmiQveI).

Notez que les contributions sous forme de pull requests sont bienvenues.
